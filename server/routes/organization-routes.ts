import { Router, Request, Response } from 'express';
import { db } from '../db';
import { organizations, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAuthenticated } from '../auth/local-auth';

const router = Router();

router.get('/current', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const orgId = (req as any).organizationId;

    if (!orgId) {
      return res.json({ organization: null, message: 'No organization assigned' });
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
    if (!org) {
      return res.json({ organization: null });
    }

    const members = await db.select({ id: users.id }).from(users).where(eq(users.organizationId, orgId));

    res.json({
      organization: { ...org, memberCount: members.length }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, description, logo } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Organization name is required (min 2 characters)' });
    }

    const [org] = await db.insert(organizations).values({
      name: name.trim(),
      description: description || null,
      logo: logo || null,
      ownerId: parseInt(user.id) || null,
      plan: 'alpha',
      isActive: true,
    }).returning();

    await db.update(users).set({
      organizationId: org.id,
      role: 'admin'
    }).where(eq(users.id, user.id));

    (req.session as any).organizationId = org.id;

    res.status(201).json({ organization: org });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

router.put('/current', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const orgId = (req as any).organizationId;

    if (!orgId) {
      return res.status(400).json({ error: 'No organization assigned' });
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and managers can update organization settings' });
    }

    const { name, description, logo, settings } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (settings !== undefined) updateData.settings = settings;

    const [updated] = await db.update(organizations)
      .set(updateData)
      .where(eq(organizations.id, orgId))
      .returning();

    res.json({ organization: updated });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

router.get('/members', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).organizationId;

    if (!orgId) {
      return res.json({ members: [] });
    }

    const members = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.organizationId, orgId)).orderBy(desc(users.createdAt));

    res.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.post('/members/invite', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const orgId = (req as any).organizationId;

    if (!orgId) {
      return res.status(400).json({ error: 'No organization assigned' });
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and managers can invite members' });
    }

    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found. They must register first.' });
    }

    if (targetUser.organizationId === orgId) {
      return res.status(400).json({ error: 'User is already a member of this organization' });
    }

    await db.update(users).set({
      organizationId: orgId,
      role: role || 'user'
    }).where(eq(users.id, targetUser.id));

    res.json({ success: true, message: `${email} has been added to the organization` });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

router.put('/members/:userId/role', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const orgId = (req as any).organizationId;
    const targetUserId = req.params.userId;

    if (!orgId) {
      return res.status(400).json({ error: 'No organization assigned' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change member roles' });
    }

    const { role } = req.body;
    if (!['admin', 'manager', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, manager, user, or viewer' });
    }

    const [targetUser] = await db.select().from(users).where(
      and(eq(users.id, targetUserId), eq(users.organizationId, orgId))
    ).limit(1);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    if (targetUserId === user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    await db.update(users).set({ role }).where(eq(users.id, targetUserId));

    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.delete('/members/:userId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const orgId = (req as any).organizationId;
    const targetUserId = req.params.userId;

    if (!orgId) {
      return res.status(400).json({ error: 'No organization assigned' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    if (targetUserId === user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the organization' });
    }

    await db.update(users).set({
      organizationId: null,
      role: 'user'
    }).where(and(eq(users.id, targetUserId), eq(users.organizationId, orgId)));

    res.json({ success: true, message: 'Member removed from organization' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
