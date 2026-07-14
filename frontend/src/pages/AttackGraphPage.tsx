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
import { Card, CardContent } from '@/components/ui/Card'
import { incidentsService } from '@/services/incidents.service'
import type { AttackGraph } from '@/types'

// ─── Custom Node Components ───────────────────────────────────────
interface NodeContainerProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  colorVar: string
  badge?: string
  target?: boolean
  source?: boolean
}

function NodeContainer({
  icon: Icon,
  title,
  subtitle,
  colorVar,
  badge,
  target = true,
  source = true,
}: NodeContainerProps) {
  return (
    <div className="relative font-mono">
      {/* Target Handle */}
      {target && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: `var(--${colorVar})`,
            border: '2px solid var(--bg-surface)',
            width: 10,
            height: 10,
          }}
        />
      )}

      {/* Main Node Card */}
      <div
        className="px-4 py-3 rounded-xl border flex flex-col justify-center min-w-[200px] max-w-[240px] transition-all bg-[var(--bg-surface)] shadow-md"
        style={{
          borderColor: `var(--border)`,
          borderLeft: `4px solid var(--${colorVar})`,
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-semibold">
            {badge || 'NODE'}
          </span>
          <Icon className="w-4 h-4" style={{ color: `var(--${colorVar})` }} />
        </div>

        <p className="text-sm font-semibold text-[var(--text-primary)] font-sans whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </p>

        {subtitle && (
          <p className="text-[11px] text-[var(--text-muted)] mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {subtitle}
          </p>
        )}
      </div>

      {/* Source Handle */}
      {source && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: `var(--${colorVar})`,
            border: '2px solid var(--bg-surface)',
            width: 10,
            height: 10,
          }}
        />
      )}
    </div>
  )
}

function getSeverityColorVar(severity?: string) {
  if (severity === 'critical') return 'danger'
  if (severity === 'high') return 'warning'
  return 'primary'
}

function TechniqueNode({ data }: { data: { label: string; severity?: string; mitre_id?: string } }) {
  return (
    <NodeContainer
      icon={GitBranch}
      title={data.label}
      subtitle={data.mitre_id}
      colorVar={getSeverityColorVar(data.severity)}
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
      colorVar="primary"
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
      colorVar="warning"
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
      colorVar="info"
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
      colorVar="danger"
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
      colorVar="danger"
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
      colorVar="warning"
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
    n1: { x: 0,   y: 200 }, n2: { x: 250, y: 100 }, n3: { x: 500, y: 200 },
    n4: { x: 750, y: 100 }, n5: { x: 1000, y: 200 }, n6: { x: 1250, y: 100 },
    n7: { x: 1500, y: 200 }, n8: { x: 1750, y: 100 }, n9: { x: 2000, y: 200 },
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
    style: { stroke: 'var(--border-strong)', strokeWidth: 2 },
    labelStyle: { fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-strong)' },
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
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Attack Graph</h1>
        <p className="text-[var(--text-muted)] mt-1">Visual map of attack progression and lateral movement.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ── Graph ── */}
        <motion.div
          className="xl:col-span-3"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] overflow-hidden" style={{ height: 600 }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse w-full h-full bg-[var(--bg-surface)]" />
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                minZoom={0.1}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="var(--border)" gap={24} size={1} />
                <Controls />
                <MiniMap 
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  nodeColor={n => {
                    if (n.type === 'objective') return 'var(--danger)'
                    if (n.type === 'technique') return 'var(--primary)'
                    return 'var(--text-muted)'
                  }}
                />
              </ReactFlow>
            )}
          </div>
        </motion.div>

        {/* ── Legend / Summary ── */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 font-mono">Node Types</h3>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { icon: <Monitor className="w-4 h-4" />, label: 'Host / Asset', color: 'text-[var(--primary)]' },
                  { icon: <User className="w-4 h-4" />, label: 'User Account', color: 'text-[var(--warning)]' },
                  { icon: <Network className="w-4 h-4" />, label: 'Network', color: 'text-[var(--info)]' },
                  { icon: <GitBranch className="w-4 h-4" />, label: 'MITRE Technique', color: 'text-[var(--primary)]' },
                  { icon: <Target className="w-4 h-4" />, label: 'Objective', color: 'text-[var(--danger)]' },
                ].map(({ icon, label, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={color}>{icon}</span>
                    <span className="text-[var(--text-primary)]">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Summary</h3>
              </div>
              <div className="flex flex-col gap-3 text-sm text-[var(--text-muted)] font-mono">
                <div className="flex justify-between items-center">
                  <span>Total nodes</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-primary)]">
                    {displayGraph.nodes.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attack stages</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text-primary)]">
                    {displayGraph.edges.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Techniques</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--primary-bg)] border border-[var(--primary-ring)] text-[var(--primary)]">
                    {displayGraph.nodes.filter(n => n.type === 'technique').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
