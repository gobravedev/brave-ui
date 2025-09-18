import React, { FC, useState } from 'react';
import { Card, Row, Col, Button, Drawer, Tag, Space, Divider } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons';

// Cartoon-style flow visualization:
// (Microbe) -> [produces/activates/stimulates] -> (Mechanism: Metabolite / Immune / Neural) -> [modulates/affects] -> (Brain Function / Disease)
// - Uses SVG cartoon icons (simple shapes) and playful colors
// - Click nodes to open Drawer with details & example evidence
// - Includes a small play button to animate arrows

type CartoonNode = {
  id: string;
  title: string;
  type: 'microbe' | 'metabolite' | 'immune' | 'neural' | 'brain' | 'disease';
  desc?: string;
  evidence?: string[];
  cx: number; // svg coords
  cy: number;
};

const SAMPLE: CartoonNode[] = [
  { id: 'm1', title: 'Bifidobacterium', type: 'microbe', desc: 'Representative gut microbe', evidence: ['PMID:30000001'], cx: 90, cy: 120 },
  { id: 'm2', title: 'Porphyromonas', type: 'microbe', desc: 'Representative oral microbe', evidence: ['PMID:30123456'], cx: 90, cy: 260 },

  { id: 'met1', title: 'SCFAs (Butyrate)', type: 'metabolite', desc: 'Short-chain fatty acids alter brain function', evidence: ['PMID:31000003'], cx: 270, cy: 110 },
  { id: 'met2', title: 'Tryptophan metabolites', type: 'metabolite', desc: 'Kynurenine pathway', evidence: ['PMID:31100004'], cx: 270, cy: 260 },

  { id: 'imm1', title: 'LPS / Inflammation', type: 'immune', desc: 'Peripheral cytokines & microglia priming', evidence: ['PMID:32000005'], cx: 420, cy: 190 },
  { id: 'ne1', title: 'Vagus nerve', type: 'neural', desc: 'ENS -> Vagus -> Brain', evidence: ['PMID:33000006'], cx: 420, cy: 80 },

  { id: 'brain', title: 'Brain Function', type: 'brain', desc: 'Neurotransmission / Behavior', evidence: ['PMID:34000007'], cx: 560, cy: 160 },
  { id: 'd1', title: 'Depression', type: 'disease', desc: 'Clinical phenotype', evidence: ['PMID:35000008'], cx: 560, cy: 260 },
];

const LINKS = [
  { from: 'm1', to: 'met1', mech: 'produces' },
  { from: 'm2', to: 'met2', mech: 'produces' },
  { from: 'met1', to: 'brain', mech: 'modulates' },
  { from: 'met2', to: 'd1', mech: 'modulates' },
  { from: 'm1', to: 'imm1', mech: 'activates' },
  { from: 'imm1', to: 'd1', mech: 'affects' },
  { from: 'm2', to: 'ne1', mech: 'stimulates' },
  { from: 'ne1', to: 'brain', mech: 'modulates' },
];

const COLOR = {
  microbe: '#FFD54F',
  metabolite: '#4FC3F7',
  immune: '#FF8A80',
  neural: '#A5D6A7',
  brain: '#B39DDB',
  disease: '#90A4AE',
};

export const PsycMicroGraphCartoon: FC = () => {
  const [playing, setPlaying] = useState(false);
  const [drawer, setDrawer] = useState<{ open: boolean; node?: CartoonNode }>({ open: false });

  return (
    <Card style={{ borderRadius: 12, padding: 12 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Mechanism Cartoon Flow</div>
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => setPlaying((p) => !p)}
            type={playing ? 'primary' : 'default'}
          >
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </Row>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <svg viewBox="0 0 680 360" width="100%" style={{ background: 'linear-gradient(180deg,#f7fcfb,#eaf8f3)' }}>
            {/* cartoon background hints */}
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* links as curved animated paths */}
            {LINKS.map((l, idx) => {
              const f = SAMPLE.find((s) => s.id === l.from)!;
              const t = SAMPLE.find((s) => s.id === l.to)!;
              const midX = (f.cx + t.cx) / 2;
              const midY = (f.cy + t.cy) / 2 - 20;
              const path = `M ${f.cx} ${f.cy} Q ${midX} ${midY} ${t.cx} ${t.cy}`;
              const color = l.mech === 'produces' || l.mech === 'modulates' ? '#6C9BD6' : l.mech === 'activates' ? '#E57373' : '#81C784';
              return (
                <g key={idx}>
                  <path d={path} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9} />

                  {/* arrow triangle */}
                  <path d={`M ${t.cx - 8} ${t.cy - 6} L ${t.cx} ${t.cy} L ${t.cx - 8} ${t.cy + 6}`} fill={color} opacity={0.95} />

                  {/* animated dot when playing */}
                  {playing && (
                    <circle cx={f.cx} cy={f.cy} r="6" fill={color} style={{ animation: `move${idx} 1600ms linear infinite` }} />
                  )}

                  <style>{`
                    @keyframes move${idx} {
                      0% { transform: translate(${f.cx}px, ${f.cy}px) }
                      100% { transform: translate(${t.cx - f.cx}px, ${t.cy - f.cy}px) }
                    }
                  `}</style>
                </g>
              );
            })}

            {/* nodes */}
            {SAMPLE.map((n) => {
              const x = n.cx;
              const y = n.cy;
              const radius = n.type === 'microbe' ? 28 : n.type === 'brain' ? 44 : 24;
              return (
                <g key={n.id} transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={() => setDrawer({ open: true, node: n })}>
                  {/* shadow */}
                  <ellipse cx={6} cy={radius + 8} rx={radius + 6} ry={10} fill="#000" opacity={0.08} />

                  {/* shape by type: microbes bubbly, metabolite droplet, immune spiky, neural cable, brain cloud, disease sad cloud */}

                  {n.type === 'microbe' && (
                    <g>
                      <circle r={radius} fill={COLOR.microbe} stroke="#d99f2b" strokeWidth={2} filter="url(#shadow)" />
                      {/* little eyes */}
                      <circle cx={-8} cy={-4} r={3} fill="#222" />
                      <circle cx={6} cy={-4} r={3} fill="#222" />
                      {/* smile */}
                      <path d={`M ${-10} 6 Q 0 ${12} 10 6`} stroke="#663E00" strokeWidth={2} fill="none" strokeLinecap="round" />
                    </g>
                  )}

                  {n.type === 'metabolite' && (
                    <g>
                      <path d={`M 0 ${-radius} C ${radius} ${-radius/2} ${radius} ${radius/2} 0 ${radius} C ${-radius} ${radius/2} ${-radius} ${-radius/2} 0 ${-radius} Z`} fill={COLOR.metabolite} stroke="#2fa1d6" strokeWidth={2} filter="url(#shadow)" />
                      <circle cx={-6} cy={-6} r={3} fill="#fff" opacity={0.6} />
                    </g>
                  )}

                  {n.type === 'immune' && (
                    <g>
                      {/* spiky cell */}
                      <g>
                        {[...Array(8)].map((_, i) => {
                          const a = (i / 8) * Math.PI * 2;
                          const x1 = Math.cos(a) * (radius + 6);
                          const y1 = Math.sin(a) * (radius + 6);
                          const x2 = Math.cos(a + 0.2) * (radius - 2);
                          const y2 = Math.sin(a + 0.2) * (radius - 2);
                          return <path key={i} d={`M ${x2} ${y2} L ${x1} ${y1}`} stroke="#e25555" strokeWidth={3} strokeLinecap="round" />;
                        })}
                        <circle r={radius - 6} fill={COLOR.immune} stroke="#d74b4b" strokeWidth={2} filter="url(#shadow)" />
                      </g>
                    </g>
                  )}

                  {n.type === 'neural' && (
                    <g>
                      {/* cable */}
                      <rect x={-radius} y={-8} width={radius * 2} height={16} rx={8} fill={COLOR.neural} stroke="#5aa56a" strokeWidth={2} filter="url(#shadow)" />
                      <circle cx={0} cy={0} r={12} fill="#fff" opacity={0.08} />
                      <text x={0} y={5} textAnchor="middle" fontSize={10} fill="#123">Vagus</text>
                    </g>
                  )}

                  {n.type === 'brain' && (
                    <g>
                      <path d={`M -35 -10 C -45 -40 10 -60 35 -40 C 60 -20 50 10 20 20 C 40 40 10 60 -10 50 C -40 30 -20 0 -35 -10 Z`} fill={COLOR.brain} stroke="#8e6fb8" strokeWidth={2} filter="url(#shadow)" />
                      <text x={0} y={6} textAnchor="middle" fontSize={12} fill="#fff">Brain</text>
                    </g>
                  )}

                  {n.type === 'disease' && (
                    <g>
                      <ellipse rx={radius} ry={radius - 6} fill={COLOR.disease} stroke="#6f7f88" strokeWidth={2} filter="url(#shadow)" />
                      <text x={0} y={6} textAnchor="middle" fontSize={11} fill="#fff">{n.title.split(' ')[0]}</text>
                    </g>
                  )}

                  {/* label */}
                  <text x={0} y={radius + 18} textAnchor="middle" fontSize={12} fill="#333">{n.title}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ width: 320 }}>
          <Card bordered={false} style={{ height: 280 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Legend</div>
            <Space direction="vertical">
              <div><Tag color="#FFD54F">Microbe</Tag> friendly microbes with simple faces</div>
              <div><Tag color="#4FC3F7">Metabolite</Tag> droplets & molecules</div>
              <div><Tag color="#FF8A80">Immune</Tag> spiky cells</div>
              <div><Tag color="#A5D6A7">Neural</Tag> nerve cable</div>
              <div><Tag color="#B39DDB">Brain</Tag> target</div>
            </Space>

            <Divider />
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick tips</div>
            <div style={{ color: '#555' }}>
              Click any cartoon node to open details. Hit Play to animate information flow from microbes to brain. Use Export to save the figure (TODO).
            </div>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Examples</div>
            <div style={{ marginTop: 8 }}>
              <div><strong>Bifidobacterium → SCFAs → Brain</strong></div>
              <div style={{ color: '#666' }}>Butyrate from gut microbes supports BBB integrity and modulates microglia.</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div><strong>Porphyromonas → LPS → Depression</strong></div>
              <div style={{ color: '#666' }}>Oral pathogens may increase systemic inflammation linked to depressive symptoms.</div>
            </div>
          </Card>
        </div>
      </div>

      <Drawer visible={drawer.open} onClose={() => setDrawer({ open: false })} title={drawer.node?.title} width={360}>
        {drawer.node && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>{drawer.node.type.toUpperCase()}</div>
            <div style={{ marginBottom: 8 }}>{drawer.node.desc}</div>
            <div style={{ marginBottom: 8 }}><strong>Evidence</strong></div>
            {drawer.node.evidence?.map((e) => (
              <Tag key={e} style={{ marginBottom: 6, cursor: 'pointer' }}>{e}</Tag>
            ))}
            <Divider />
            <Button type="primary" block icon={<InfoCircleOutlined />}>View associations</Button>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default PsycMicroGraphCartoon;
