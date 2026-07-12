import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactFlow, {
  Background, Controls, MiniMap,
  type Node, type Edge, type NodeTypes,
  MarkerType, Handle, Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { GitBranch, AlertTriangle, Monitor, User, Network, Target, Skull, Cpu } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent, Badge, SeverityBadge, Skeleton } from '@/components/ui'
import { incidentsService } from '@/services/incidents.service'
import type { AttackGraph } from '@/types'
import { getSeverityColor } from '@/lib/utils'

// ─── Glowing node wrapper component ──────────────────────────────
interface NodeContainerProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  color: string
  badge?: string
  target?: boolean
  source?: boolean
}

function NodeContainer({
  icon: Icon,
  title,
  subtitle,
  color,
  badge,
  target = true,
  source = true,
}: NodeContainerProps) {
  return (
    <div style={{ position: 'relative', fontFamily: 'var(--font-mono)' }}>
      {/* Ambient shadow glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--r-xl)',
          background: color,
          filter: 'blur(8px)',
          opacity: 0.18,
          zIndex: -1,
        }}
      />

      {/* Target connection point */}
      {target && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            border: '2px solid #071022',
            width: 8,
            height: 8,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      )}

      {/* Main card box */}
      <div
        className="px-4 py-3 rounded-xl border flex flex-col justify-center min-w-[200px] max-w-[240px] transition-all duration-200"
        style={{
          background: 'rgba(7, 16, 34, 0.85)',
          borderColor: `${color}35`,
          borderLeft: `4px solid ${color}`,
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 8, color: 'var(--tx-low)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {badge || 'NODE'}
          </span>
          <Icon style={{ width: 12, height: 12, color }} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-high)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>

        {subtitle && (
          <p style={{ fontSize: 9, color: 'var(--tx-low)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Source connection point */}
      {source && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: color,
            border: '2px solid #071022',
            width: 8,
            height: 8,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      )}
    </div>
  )
}

function TechniqueNode({ data }: { data: { label: string; severity?: string; mitre_id?: string } }) {
  const color = data.severity ? getSeverityColor(data.severity) : 'var(--warn)'
  return (
    <NodeContainer
      icon={GitBranch}
      title={data.label}
      subtitle={data.mitre_id}
      color={color}
      badge="mitre technique"
    />
  )
}

function HostNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={Monitor}
      title={data.label}
      subtitle="Endpoint Host"
      color="var(--accent)"
      badge="host asset"
    />
  )
}

function UserNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={User}
      title={data.label}
      subtitle="Identity Profile"
      color="#A78BFA"
      badge="user credential"
    />
  )
}

function NetworkNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={Network}
      title={data.label}
      subtitle="Network Segment"
      color="#34D399"
      badge="network zone"
    />
  )
}

function ObjectiveNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={Target}
      title={data.label}
      subtitle="Impact Status"
      color="var(--danger)"
      badge="objective target"
      source={false}
    />
  )
}

function ThreatActorNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={Skull}
      title={data.label}
      subtitle="Attribution Profile"
      color="#F43F5E"
      badge="threat actor"
      target={false}
    />
  )
}

function PhysicalAssetNode({ data }: { data: { label: string } }) {
  return (
    <NodeContainer
      icon={Cpu}
      title={data.label}
      subtitle="Grid Equipment"
      color="var(--warn)"
      badge="physical asset"
    />
  )
}

const nodeTypes: NodeTypes = {
  technique: TechniqueNode,
  host: HostNode,
  user: UserNode,
  network: NetworkNode,
  process: HostNode,
  objective: ObjectiveNode,
  threat_actor: ThreatActorNode,
  physical_asset: PhysicalAssetNode,
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

    attacker: { x: 0, y: 180 },
    'ws-07': { x: 250, y: 100 },
    'user-rsharma': { x: 500, y: 180 },
    'scada-ws-02': { x: 750, y: 100 },
    'breaker-4': { x: 1000, y: 180 },
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
    style: { stroke: 'rgba(0, 217, 180, 0.45)', strokeWidth: 2, filter: 'drop-shadow(0 0 3px rgba(0, 217, 180, 0.25))' },
    labelStyle: { fill: 'var(--tx-low)', fontSize: 9, fontFamily: 'var(--font-mono)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
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
    <PageContainer>
      {/* Page header */}
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: '#3d566e' }}>Cyber Kill Chain Visualization</div>
        <h1 className="text-xl font-bold font-mono" style={{ color: '#E2E8F0' }}>Attack Graph</h1>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: '#8FA3BF' }}>Visual map of attack progression and lateral movement</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
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
