import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactFlow, {
  Background, Controls, MiniMap,
  type Node, type Edge, type NodeTypes,
  MarkerType, Handle, Position,
} from 'reactflow'
import { motion } from 'framer-motion'
import { GitBranch, AlertTriangle, Monitor, User, Network, Target } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent, Badge, SeverityBadge, Skeleton } from '@/components/ui'
import { incidentsService } from '@/services/incidents.service'
import type { AttackGraph } from '@/types'
import { getSeverityColor } from '@/lib/utils'

// ─── Custom node types ───────────────────────────────────────────
function TechniqueNode({ data }: { data: { label: string; severity?: string; mitre_id?: string } }) {
  const color = data.severity ? getSeverityColor(data.severity) : '#00E5FF'
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none' }} />
      <div
        className="px-3 py-2 rounded-lg border text-xs font-medium max-w-[160px]"
        style={{
          background: `${color}15`,
          borderColor: `${color}30`,
          color,
          boxShadow: `0 0 12px ${color}20`,
        }}
      >
        {data.mitre_id && <div className="text-[10px] opacity-70 mb-0.5">{data.mitre_id}</div>}
        <div className="truncate">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none' }} />
    </>
  )
}

function HostNode({ data }: { data: { label: string } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#8FA3BF', border: 'none' }} />
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs text-[#E2E8F0] max-w-[140px]">
        <Monitor className="w-3.5 h-3.5 text-[#8FA3BF] shrink-0" />
        <span className="truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#8FA3BF', border: 'none' }} />
    </>
  )
}

function UserNode({ data }: { data: { label: string } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#8FA3BF', border: 'none' }} />
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs text-[#E2E8F0] max-w-[140px]">
        <User className="w-3.5 h-3.5 text-[#3d566e] shrink-0" />
        <span className="truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#8FA3BF', border: 'none' }} />
    </>
  )
}

function NetworkNode({ data }: { data: { label: string } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#8FA3BF', border: 'none' }} />
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-2 text-xs text-[#8FA3BF] max-w-[140px]">
        <Network className="w-3.5 h-3.5 text-[#3d566e] shrink-0" />
        <span className="truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#8FA3BF', border: 'none' }} />
    </>
  )
}

function ObjectiveNode({ data }: { data: { label: string } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#E75A43', border: 'none' }} />
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-danger/30 bg-danger/10 text-xs text-danger max-w-[160px]">
        <Target className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate font-semibold">{data.label}</span>
      </div>
    </>
  )
}

const nodeTypes: NodeTypes = {
  technique: TechniqueNode,
  host: HostNode,
  user: UserNode,
  network: NetworkNode,
  process: HostNode,
  objective: ObjectiveNode,
}

// ─── Mock data ───────────────────────────────────────────────────
const MOCK_GRAPH: AttackGraph = {
  incident_id: '1',
  generated_at: new Date().toISOString(),
  nodes: [
    { id: 'n1', type: 'user',      label: 'john.doe@corp.com' },
    { id: 'n2', type: 'technique', label: 'Spear Phishing',      mitre_id: 'T1566.001', severity: 'high' },
    { id: 'n3', type: 'host',      label: 'WS-07' },
    { id: 'n4', type: 'technique', label: 'PowerShell Execution', mitre_id: 'T1059.001', severity: 'high' },
    { id: 'n5', type: 'technique', label: 'Cred Dumping (LSASS)', mitre_id: 'T1003.001', severity: 'critical' },
    { id: 'n6', type: 'host',      label: 'DC-01' },
    { id: 'n7', type: 'technique', label: 'Lateral Movement RDP', mitre_id: 'T1021.001', severity: 'high' },
    { id: 'n8', type: 'technique', label: 'Shadow Copy Delete',   mitre_id: 'T1490',     severity: 'critical' },
    { id: 'n9', type: 'objective', label: 'Ransomware Deployment' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: 'received' },
    { id: 'e2', source: 'n2', target: 'n3', label: 'initial access' },
    { id: 'e3', source: 'n3', target: 'n4', label: 'executes' },
    { id: 'e4', source: 'n4', target: 'n5', label: 'leads to' },
    { id: 'e5', source: 'n5', target: 'n6', label: 'pivot to' },
    { id: 'e6', source: 'n6', target: 'n7', label: 'executes' },
    { id: 'e7', source: 'n7', target: 'n8', label: 'followed by' },
    { id: 'e8', source: 'n8', target: 'n9', label: 'enables' },
  ],
}

function buildFlowElements(graph: AttackGraph): { nodes: Node[]; edges: Edge[] } {
  const positions: Record<string, { x: number; y: number }> = {
    n1: { x: 0,   y: 200 }, n2: { x: 200, y: 100 }, n3: { x: 400, y: 200 },
    n4: { x: 600, y: 100 }, n5: { x: 800, y: 200 }, n6: { x: 1000, y: 100 },
    n7: { x: 1200, y: 200 }, n8: { x: 1400, y: 100 }, n9: { x: 1600, y: 200 },
  }

  const nodes: Node[] = graph.nodes.map(n => ({
    id: n.id,
    type: n.type,
    position: positions[n.id] ?? { x: Math.random() * 1400, y: Math.random() * 400 },
    data: { label: n.label, severity: n.severity, mitre_id: n.mitre_id },
  }))

  const edges: Edge[] = graph.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#1E293B', strokeWidth: 1.5 },
    labelStyle: { fill: '#64748B', fontSize: 10 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1E293B' },
  }))

  return { nodes, edges }
}

export function AttackGraphPage() {
  const { incidentId } = useParams<{ incidentId?: string }>()

  const { data: graph, isLoading } = useQuery({
    queryKey: ['attack-graph', incidentId],
    queryFn: () => incidentsService.getAttackGraph(incidentId!),
    enabled: !!incidentId,
  })

  const displayGraph = graph ?? MOCK_GRAPH
  const { nodes, edges } = useMemo(() => buildFlowElements(displayGraph), [displayGraph])

  return (
    <PageContainer
      title="Attack Graph"
      description="Visual map of attack progression and lateral movement"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Graph */}
        <motion.div
          className="xl:col-span-3"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-[#1E293B] bg-[#0A1120] overflow-hidden" style={{ height: 540 }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="var(--color-border)" gap={24} size={1} />
                <Controls
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                />
                <MiniMap
                  style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}
                  nodeColor={n => {
                    if (n.type === 'objective') return '#E75A43'
                    if (n.type === 'technique') return '#8EDDBE'
                    return '#1a2942'
                  }}
                />
              </ReactFlow>
            )}
          </div>
        </motion.div>

        {/* Legend / summary */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-3 font-mono">Node Types</h3>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  { icon: <Monitor className="w-3.5 h-3.5" />, label: 'Host / Asset', color: '#8FA3BF' },
                  { icon: <User className="w-3.5 h-3.5" />, label: 'User Account', color: '#3d566e' },
                  { icon: <Network className="w-3.5 h-3.5" />, label: 'Network', color: '#3d566e' },
                  { icon: <GitBranch className="w-3.5 h-3.5" />, label: 'MITRE Technique', color: '#8EDDBE' },
                  { icon: <Target className="w-3.5 h-3.5" />, label: 'Objective', color: '#E75A43' },
                ].map(({ icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2" style={{ color }}>
                    {icon}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider mb-3 font-mono">Attack Stages</h3>
              <div className="flex flex-col gap-2">
                {displayGraph.nodes
                  .filter(n => n.type === 'technique')
                  .map(n => (
                    <div key={n.id} className="flex items-center gap-2 text-xs">
                      <SeverityBadge severity={n.severity ?? 'info'} />
                      <span className="text-[#8FA3BF] truncate">{n.label}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <h3 className="text-xs font-semibold text-[#8FA3BF] uppercase tracking-wider font-mono">Summary</h3>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#3d566e] font-mono">
                <div className="flex justify-between">
                  <span>Total nodes</span>
                  <Badge variant="default">{displayGraph.nodes.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Attack stages</span>
                  <Badge variant="default">{displayGraph.edges.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Techniques</span>
                  <Badge variant="primary">{displayGraph.nodes.filter(n => n.type === 'technique').length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
