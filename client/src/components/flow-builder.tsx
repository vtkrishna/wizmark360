import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, Send, Clock, GitBranch, Play, Pause, 
  Plus, Trash2, Settings, ArrowDown, ArrowRight, Zap,
  Bot, User, Phone, Mail, Globe, Sparkles, Save
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'message' | 'condition' | 'delay' | 'action' | 'ai';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  nextNodes: string[];
}

interface Flow {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  trigger: string;
  nodes: FlowNode[];
}

const nodeTypes = [
  { type: 'trigger', icon: Zap, color: 'bg-yellow-500', label: 'Trigger', description: 'Start condition' },
  { type: 'message', icon: MessageCircle, color: 'bg-blue-500', label: 'Message', description: 'Send message' },
  { type: 'condition', icon: GitBranch, color: 'bg-purple-500', label: 'Condition', description: 'If/else logic' },
  { type: 'delay', icon: Clock, color: 'bg-orange-500', label: 'Delay', description: 'Wait for time' },
  { type: 'action', icon: Settings, color: 'bg-green-500', label: 'Action', description: 'Perform action' },
  { type: 'ai', icon: Bot, color: 'bg-pink-500', label: 'AI Agent', description: 'AI-powered response' },
];

const sampleFlows: Flow[] = [
  {
    id: '1',
    name: 'Welcome Flow',
    status: 'active',
    trigger: 'new_contact',
    nodes: [
      { id: 'n1', type: 'trigger', title: 'New Contact', config: { event: 'new_contact' }, position: { x: 0, y: 0 }, nextNodes: ['n2'] },
      { id: 'n2', type: 'message', title: 'Welcome Message', config: { text: 'Welcome! How can we help?' }, position: { x: 0, y: 1 }, nextNodes: ['n3'] },
      { id: 'n3', type: 'ai', title: 'AI Assistant', config: { agent: 'support' }, position: { x: 0, y: 2 }, nextNodes: [] },
    ]
  },
  {
    id: '2',
    name: 'Order Status Flow',
    status: 'active',
    trigger: 'keyword',
    nodes: [
      { id: 'n1', type: 'trigger', title: 'Keyword: order', config: { keyword: 'order' }, position: { x: 0, y: 0 }, nextNodes: ['n2'] },
      { id: 'n2', type: 'action', title: 'Fetch Order', config: { action: 'api_call' }, position: { x: 0, y: 1 }, nextNodes: ['n3'] },
      { id: 'n3', type: 'message', title: 'Order Details', config: { text: 'Your order status...' }, position: { x: 0, y: 2 }, nextNodes: [] },
    ]
  },
  {
    id: '3',
    name: 'Lead Qualification',
    status: 'draft',
    trigger: 'form_submit',
    nodes: [
      { id: 'n1', type: 'trigger', title: 'Form Submit', config: { form: 'contact' }, position: { x: 0, y: 0 }, nextNodes: ['n2'] },
      { id: 'n2', type: 'ai', title: 'Score Lead', config: { agent: 'lead_scorer' }, position: { x: 0, y: 1 }, nextNodes: ['n3'] },
      { id: 'n3', type: 'condition', title: 'Score > 70?', config: { operator: 'gt', value: 70 }, position: { x: 0, y: 2 }, nextNodes: ['n4', 'n5'] },
      { id: 'n4', type: 'message', title: 'High Priority', config: { text: 'Thanks! Our team will call you shortly.' }, position: { x: -1, y: 3 }, nextNodes: [] },
      { id: 'n5', type: 'message', title: 'Follow Up', config: { text: 'Thanks for your interest!' }, position: { x: 1, y: 3 }, nextNodes: [] },
    ]
  },
];

interface FlowBuilderProps {
  vertical?: 'whatsapp' | 'instagram' | 'email';
}

export function FlowBuilder({ vertical = 'whatsapp' }: FlowBuilderProps) {
  const [flows, setFlows] = useState<Flow[]>(sampleFlows);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);

  const getNodeIcon = (type: string) => {
    return nodeTypes.find(n => n.type === type)?.icon || MessageCircle;
  };

  const getNodeColor = (type: string) => {
    return nodeTypes.find(n => n.type === type)?.color || 'bg-gray-500';
  };

  const handleStatusToggle = (flowId: string) => {
    setFlows(flows.map(f => {
      if (f.id === flowId) {
        return { ...f, status: f.status === 'active' ? 'paused' : 'active' };
      }
      return f;
    }));
  };

  const addNode = (type: string) => {
    if (!selectedFlow) return;
    const newNode: FlowNode = {
      id: `n${Date.now()}`,
      type: type as any,
      title: nodeTypes.find(n => n.type === type)?.label || 'Node',
      config: {},
      position: { x: 0, y: selectedFlow.nodes.length },
      nextNodes: []
    };
    
    const lastNode = selectedFlow.nodes[selectedFlow.nodes.length - 1];
    if (lastNode) {
      lastNode.nextNodes = [newNode.id];
    }
    
    setSelectedFlow({
      ...selectedFlow,
      nodes: [...selectedFlow.nodes, newNode]
    });
    setShowNodeModal(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold">Automation Flows</h2>
          <Badge className="bg-green-100 text-green-700">
            {flows.filter(f => f.status === 'active').length} Active
          </Badge>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-600 to-purple-600"
          onClick={() => {
            const newFlow: Flow = {
              id: String(Date.now()),
              name: 'New Flow',
              status: 'draft',
              trigger: 'message',
              nodes: []
            };
            setFlows([...flows, newFlow]);
            setSelectedFlow(newFlow);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> New Flow
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-3 overflow-y-auto">
          <div className="text-sm font-medium text-gray-500 mb-2">Your Flows</div>
          {flows.map(flow => (
            <Card 
              key={flow.id}
              className={`cursor-pointer transition-all ${
                selectedFlow?.id === flow.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedFlow(flow)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{flow.name}</span>
                  <Badge 
                    variant="outline"
                    className={flow.status === 'active' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : flow.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {flow.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Zap className="h-3 w-3" />
                  {flow.trigger}
                  <span className="text-gray-300">|</span>
                  {flow.nodes.length} nodes
                </div>
                <div className="flex gap-1 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7"
                    onClick={(e) => { e.stopPropagation(); handleStatusToggle(flow.id); }}
                  >
                    {flow.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="col-span-2 bg-gray-50 rounded-lg p-4 overflow-y-auto">
          {selectedFlow ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Input 
                    value={selectedFlow.name}
                    onChange={(e) => setSelectedFlow({ ...selectedFlow, name: e.target.value })}
                    className="font-bold text-lg border-none bg-transparent p-0 h-auto"
                  />
                  <span className="text-sm text-gray-500">{selectedFlow.nodes.length} nodes</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button 
                    size="sm"
                    className={selectedFlow.status === 'active' 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                    }
                    onClick={() => handleStatusToggle(selectedFlow.id)}
                  >
                    {selectedFlow.status === 'active' ? (
                      <><Pause className="h-4 w-4 mr-1" /> Pause</>
                    ) : (
                      <><Play className="h-4 w-4 mr-1" /> Activate</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {selectedFlow.nodes.map((node, index) => {
                  const NodeIcon = getNodeIcon(node.type);
                  return (
                    <div key={node.id}>
                      <Card className="border-2 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${getNodeColor(node.type)} flex items-center justify-center`}>
                              <NodeIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{node.title}</div>
                              <div className="text-sm text-gray-500">
                                {node.type === 'message' && node.config.text}
                                {node.type === 'trigger' && `Event: ${node.config.event || node.config.keyword}`}
                                {node.type === 'ai' && `Agent: ${node.config.agent}`}
                                {node.type === 'delay' && `Wait: ${node.config.duration || '1 hour'}`}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setEditingNode(node)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => {
                                setSelectedFlow({
                                  ...selectedFlow,
                                  nodes: selectedFlow.nodes.filter(n => n.id !== node.id)
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      {index < selectedFlow.nodes.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 py-8"
                  onClick={() => setShowNodeModal(true)}
                >
                  <Plus className="h-5 w-5 mr-2" /> Add Node
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <GitBranch className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Select a flow to edit</p>
                <p className="text-sm">Or create a new automation flow</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNodeModal} onOpenChange={setShowNodeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {nodeTypes.map(nodeType => {
              const Icon = nodeType.icon;
              return (
                <button
                  key={nodeType.type}
                  onClick={() => addNode(nodeType.type)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${nodeType.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{nodeType.label}</div>
                      <div className="text-sm text-gray-500">{nodeType.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
