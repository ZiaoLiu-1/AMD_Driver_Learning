/* ============================================================
   LessonFigure — theme-aware SVG figures for micro-lessons.
   Figures render via CSS variables so they adapt to light/dark
   themes automatically. Labels use English technical terms
   (bilingual-robust); localized explanation lives in the
   lesson's diagram.caption.

   Usage: lesson.diagram.svgId = "cpu-vs-gpu" → <LessonFigure id="cpu-vs-gpu" />
   Falls back to ASCII art in MicroLessonPage when id is absent.
   ============================================================ */

const MONO = "ui-monospace, 'Menlo', 'Cascadia Mono', 'Consolas', monospace";

// ─── Primitives ──────────────────────────────────────────────
type BoxProps = {
  x: number; y: number; w: number; h: number;
  fill?: string; stroke?: string; sw?: number; rx?: number;
  dash?: string; fo?: number;
};
function B({ x, y, w, h, fill = "none", stroke = "var(--border)", sw = 1, rx = 5, dash, fo = 1 }: BoxProps) {
  return (
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} fillOpacity={fo}
      stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
  );
}

type TxtProps = {
  x: number; y: number; children: React.ReactNode;
  size?: number; fill?: string; anchor?: "start" | "middle" | "end";
  weight?: number; spacing?: string;
};
function T({ x, y, children, size = 11, fill = "var(--muted-foreground)", anchor = "middle", weight = 400, spacing }: TxtProps) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}
      fontFamily={MONO} fontWeight={weight} letterSpacing={spacing}>{children}</text>
  );
}

// Straight arrow with computed triangular head (no <marker> id collisions)
type ArrProps = { x1: number; y1: number; x2: number; y2: number; stroke?: string; sw?: number; dash?: string; head?: number };
function A({ x1, y1, x2, y2, stroke = "var(--muted-foreground)", sw = 1.2, dash, head = 5 }: ArrProps) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - head * Math.cos(ang);
  const by = y2 - head * Math.sin(ang);
  const p = (a: number) => `${bx + head * 0.7 * Math.cos(a)},${by + head * 0.7 * Math.sin(a)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${p(ang + Math.PI / 2)} ${p(ang - Math.PI / 2)}`} fill={stroke} />
    </g>
  );
}

// Section label chip
function Chip({ x, y, w, label, tone = "var(--primary)" }: { x: number; y: number; w: number; label: string; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={18} rx={9} fill={tone} fillOpacity={0.12} stroke={tone} strokeOpacity={0.45} strokeWidth={1} />
      <T x={x + w / 2} y={y + 13} size={10.5} fill={tone} weight={600}>{label}</T>
    </g>
  );
}

const FG = "var(--foreground)";
const MUT = "var(--muted-foreground)";
const ACC = "var(--primary)";   // AMD red-orange
const BLU = "var(--chart-2)";
const GRN = "var(--chart-3)";
const PUR = "var(--chart-4)";
const AMB = "var(--chart-5)";
const BRD = "var(--border)";
const CARD = "var(--card)";

// ─── Figure 1: CPU vs GPU ────────────────────────────────────
function CpuVsGpu() {
  const aluCell = (cx: number, cy: number) => (
    <rect key={`${cx}-${cy}`} x={cx} y={cy} width={30} height={20} rx={3}
      fill={ACC} fillOpacity={0.14} stroke={ACC} strokeOpacity={0.5} strokeWidth={0.8} />
  );
  const alus: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) alus.push(aluCell(475 + c * 36, 78 + r * 27));
  return (
    <svg viewBox="0 0 860 400" role="img" aria-label="CPU latency-oriented vs GPU throughput-oriented design">
      {/* CPU panel */}
      <B x={20} y={40} w={390} h={220} rx={10} />
      <Chip x={36} y={52} w={190} label="CPU · latency-oriented" tone={BLU} />
      {[0, 1].map(r => [0, 1].map(c => (
        <g key={`core${r}${c}`}>
          <B x={40 + c * 120} y={86 + r * 62} w={110} h={52} fill={BLU} fo={0.10} stroke={BLU} sw={1.1} />
          <T x={95 + c * 120} y={108 + r * 62} fill={FG} size={11.5} weight={600}>Core {r * 2 + c}</T>
          <T x={95 + c * 120} y={124 + r * 62} size={9.5}>OoO · branch pred</T>
        </g>
      )))}
      <B x={286} y={86} w={110} h={114} fill={BLU} fo={0.05} stroke={BLU} dash="4 3" />
      <T x={341} y={138} fill={FG} size={11} weight={600}>Large cache</T>
      <T x={341} y={154} size={9.5}>L1/L2/L3 · MBs</T>
      <T x={215} y={232} size={10.5}>few cores · each runs ONE thread as fast as possible</T>

      {/* GPU panel */}
      <B x={450} y={40} w={390} h={220} rx={10} />
      <Chip x={466} y={52} w={210} label="GPU · throughput-oriented" tone={ACC} />
      {alus}
      <B x={475} y={190} w={324} h={26} fill={ACC} fo={0.05} stroke={ACC} dash="4 3" sw={0.9} />
      <T x={637} y={207} size={10}>small caches · huge register files</T>
      <T x={645} y={232} size={10.5}>1000s of ALU lanes · throughput over latency</T>

      {/* latency-hiding strip */}
      <T x={20} y={296} anchor="start" size={11} fill={FG} weight={600}>Latency hiding — the core trick:</T>
      <B x={20} y={308} w={820} h={72} rx={8} />
      <T x={78} y={336} size={10} anchor="middle" fill={GRN} weight={600}>wave A</T>
      <rect x={110} y={326} width={150} height={13} rx={3} fill={GRN} fillOpacity={0.5} />
      <rect x={260} y={326} width={220} height={13} rx={3} fill={GRN} fillOpacity={0.12} />
      <T x={370} y={336} size={9.5}>waiting on VRAM (~600 cycles)</T>
      <rect x={480} y={326} width={130} height={13} rx={3} fill={GRN} fillOpacity={0.5} />
      <T x={78} y={362} size={10} anchor="middle" fill={AMB} weight={600}>wave B</T>
      <rect x={110} y={352} width={16} height={13} rx={3} fill={AMB} fillOpacity={0.12} />
      <rect x={260} y={352} width={220} height={13} rx={3} fill={AMB} fillOpacity={0.5} />
      <A x1={262} y1={344} x2={262} y2={352} stroke={ACC} sw={1.4} />
      <T x={700} y={362} size={10}>SIMD switches waves → ALUs never idle</T>
    </svg>
  );
}

// ─── Figure 2: AMD GPU as a set of IP blocks ─────────────────
function AmdGpuIpBlocks() {
  const blocks: Array<[string, string, number, number, number, number, string]> = [
    // label, sub, x, y, w, h, tone
    ["GC", "Graphics & Compute — CUs, CP, caches", 40, 96, 380, 120, ACC],
    ["SDMA", "DMA / paging engine", 40, 228, 184, 58, BLU],
    ["VCN", "video encode/decode", 236, 228, 184, 58, BLU],
    ["DCN", "display controller", 40, 298, 184, 58, GRN],
    ["PSP", "security · fw loading", 236, 298, 184, 58, PUR],
    ["GMC/VM", "memory hub · GPUVM page tables", 452, 96, 180, 120, AMB],
    ["IH", "interrupt handler", 452, 228, 180, 58, PUR],
    ["SMU", "clocks · power mgmt", 452, 298, 180, 58, PUR],
  ];
  return (
    <svg viewBox="0 0 860 430" role="img" aria-label="AMD GPU ASIC composed of versioned IP blocks">
      <B x={20} y={40} w={636} h={340} rx={12} sw={1.4} />
      <Chip x={36} y={54} w={200} label="one AMD GPU ASIC" tone={FG as string} />
      {blocks.map(([l, s, x, y, w, h, tone]) => (
        <g key={l}>
          <B x={x} y={y} w={w} h={h} fill={tone} fo={0.10} stroke={tone} sw={1.1} />
          <T x={x + w / 2} y={y + (h > 100 ? 28 : 24)} fill={FG} size={12.5} weight={700}>{l}</T>
          <T x={x + w / 2} y={y + (h > 100 ? 46 : 41)} size={9.5}>{s}</T>
        </g>
      ))}
      <T x={230} y={196} size={10} fill={ACC}>the block this course lives in</T>

      {/* External connections */}
      <A x1={338} y1={380} x2={338} y2={404} sw={1.3} />
      <T x={338} y={418} size={10}>PCIe ↔ CPU</T>
      <A x1={656} y1={156} x2={700} y2={156} sw={1.3} />
      <B x={700} y={130} w={140} h={52} fill={AMB} fo={0.07} stroke={AMB} dash="4 3" />
      <T x={770} y={152} fill={FG} size={11} weight={600}>VRAM</T>
      <T x={770} y={168} size={9.5}>GDDR6 / HBM</T>
      <A x1={132} y1={356} x2={132} y2={404} sw={1.3} stroke={GRN} />
      <T x={132} y={418} size={10}>DisplayPort / HDMI</T>

      {/* driver mapping note */}
      <B x={676} y={220} w={164} h={160} rx={8} dash="4 3" />
      <T x={758} y={244} fill={FG} size={10.5} weight={600}>amdgpu driver mirrors this:</T>
      <T x={758} y={266} size={9.5} fill={ACC}>gfx_v11_0.c</T>
      <T x={758} y={284} size={9.5} fill={BLU}>sdma_v6_0.c</T>
      <T x={758} y={302} size={9.5} fill={BLU}>vcn_v4_0.c</T>
      <T x={758} y={320} size={9.5} fill={GRN}>dcn/ (display)</T>
      <T x={758} y={338} size={9.5} fill={PUR}>psp_v13_0.c …</T>
      <T x={758} y={362} size={9.5}>one IP = one module</T>
    </svg>
  );
}

// ─── Figure 3: work-item → wavefront → workgroup → grid ─────
function ThreadHierarchy() {
  const lane = (i: number, active: boolean) => (
    <rect key={i} x={40 + i * 24} y={296} width={20} height={20} rx={3}
      fill={active ? ACC : MUT} fillOpacity={active ? 0.35 : 0.10}
      stroke={active ? ACC : MUT} strokeOpacity={active ? 0.8 : 0.35} strokeWidth={0.9} />
  );
  return (
    <svg viewBox="0 0 860 470" role="img" aria-label="Grid, workgroup, wavefront and work-item hierarchy">
      {/* Grid */}
      <B x={20} y={42} w={250} h={190} rx={10} />
      <Chip x={36} y={54} w={130} label="Grid (kernel)" tone={PUR} />
      {[0, 1, 2].map(r => [0, 1, 2].map(c => (
        <B key={`wg${r}${c}`} x={40 + c * 72} y={88 + r * 44} w={62} h={34} fill={PUR} fo={r === 0 && c === 0 ? 0.28 : 0.10} stroke={PUR} sw={0.9} />
      )))}
      <T x={145} y={218} size={9.5}>all workgroups of one dispatch</T>

      {/* Workgroup */}
      <A x1={270} y1={110} x2={318} y2={110} sw={1.4} stroke={PUR} />
      <B x={318} y={42} w={250} h={190} rx={10} />
      <Chip x={334} y={54} w={170} label="Workgroup ≤1024" tone={GRN} />
      {[0, 1, 2, 3].map(i => (
        <g key={`wf${i}`}>
          <B x={338} y={86 + i * 31} w={210} h={24} fill={GRN} fo={i === 0 ? 0.28 : 0.10} stroke={GRN} sw={0.9} />
          <T x={443} y={102 + i * 31} size={9.5} fill={i === 0 ? FG : MUT}>wavefront {i}</T>
        </g>
      ))}
      <T x={443} y={222} size={9.5}>shares LDS · barrier sync · one WGP</T>

      {/* Wavefront */}
      <A x1={568} y1={101} x2={616} y2={101} sw={1.4} stroke={GRN} />
      <B x={616} y={42} w={224} h={190} rx={10} />
      <Chip x={632} y={54} w={150} label="Wavefront = 32" tone={ACC} />
      <T x={728} y={100} size={10} fill={FG}>one instruction stream</T>
      <T x={728} y={118} size={10} fill={FG}>32 lanes in lockstep</T>
      <T x={728} y={148} size={9.5}>RDNA: wave32 native</T>
      <T x={728} y={166} size={9.5}>(wave64 = 2 cycles)</T>
      <T x={728} y={184} size={9.5}>GCN/CDNA: always 64</T>
      <T x={728} y={214} size={9.5} fill={ACC}>= AMD's "warp"</T>

      {/* EXEC mask lanes */}
      <T x={20} y={278} anchor="start" size={11} fill={FG} weight={600}>One wave32 — EXEC mask controls which lanes are live:</T>
      {Array.from({ length: 32 }, (_, i) => lane(i, !(i >= 12 && i < 20)))}
      <T x={40} y={344} anchor="start" size={9.5}>lane 0</T>
      <T x={806} y={344} anchor="end" size={9.5}>lane 31</T>
      <T x={430} y={344} size={9.5} fill={ACC}>if(cond){"{"}…{"}"} divergence → masked lanes idle</T>

      {/* naming table */}
      <B x={20} y={366} w={820} h={86} rx={8} />
      <T x={110} y={392} size={10.5} fill={FG} weight={600}>AMD / OpenCL</T>
      <T x={110} y={416} size={10}>work-item</T>
      <T x={110} y={436} size={10}>wavefront · workgroup</T>
      <line x1={340} y1={376} x2={340} y2={442} stroke={BRD} strokeWidth={1} />
      <T x={470} y={392} size={10.5} fill={FG} weight={600}>HIP / CUDA</T>
      <T x={470} y={416} size={10}>thread</T>
      <T x={470} y={436} size={10}>warp(NV)/wave · block</T>
      <line x1={640} y1={376} x2={640} y2={442} stroke={BRD} strokeWidth={1} />
      <T x={745} y={392} size={10.5} fill={FG} weight={600}>Hardware</T>
      <T x={745} y={416} size={10}>SIMD lane</T>
      <T x={745} y={436} size={10}>SIMD slot · WGP</T>
    </svg>
  );
}

// ─── Figure 4: inside a WGP / CU ─────────────────────────────
function WgpCuInternals() {
  const simd = (x: number, y: number, n: number) => (
    <g key={`s${x}${y}`}>
      <B x={x} y={y} w={150} h={64} fill={ACC} fo={0.10} stroke={ACC} sw={1.1} />
      <T x={x + 75} y={y + 18} fill={FG} size={10.5} weight={700}>SIMD32 #{n}</T>
      <T x={x + 75} y={y + 34} size={9}>32-lane vector ALU</T>
      <B x={x + 12} y={y + 42} w={126} h={14} fill={AMB} fo={0.18} stroke={AMB} sw={0.8} rx={3} />
      <T x={x + 75} y={y + 53} size={8.5} fill={FG}>VGPRs 192 KiB</T>
    </g>
  );
  return (
    <svg viewBox="0 0 860 450" role="img" aria-label="Workgroup processor and compute unit internals">
      {/* breadcrumb */}
      {[["GPU", 20, 96], ["Shader Engine ×4-6", 136, 170], ["Shader Array ×2", 326, 150], ["WGP ×4-5", 496, 110]].map(([l, x, w], i) => (
        <g key={l as string}>
          <B x={x as number} y={20} w={w as number} h={26} fill={i === 3 ? ACC : "none"} fo={i === 3 ? 0.12 : 1} stroke={i === 3 ? ACC : BRD} />
          <T x={(x as number) + (w as number) / 2} y={37} size={10} fill={i === 3 ? ACC : MUT} weight={i === 3 ? 700 : 400}>{l}</T>
          {i < 3 && <A x1={(x as number) + (w as number)} y1={33} x2={(x as number) + (w as number) + 20} y2={33} sw={1.1} />}
        </g>
      ))}
      <T x={688} y={37} anchor="start" size={9.5}>Navi31: 6×2×4=48 WGP=96 CU</T>

      {/* WGP box */}
      <B x={20} y={64} w={820} h={300} rx={12} sw={1.4} />
      <Chip x={36} y={78} w={280} label="WGP (Workgroup Processor) = 2 CU" tone={ACC} />

      {/* CU0 */}
      <B x={40} y={112} w={340} h={168} rx={8} />
      <T x={90} y={134} size={11} fill={FG} weight={700}>CU 0</T>
      {simd(56, 146, 0)}
      {simd(216, 146, 1)}
      <B x={56} y={220} w={150} h={44} fill={BLU} fo={0.10} stroke={BLU} sw={1} />
      <T x={131} y={238} fill={FG} size={10} weight={600}>Scalar unit</T>
      <T x={131} y={254} size={8.5}>SALU + SGPRs · 1 value/wave</T>
      <B x={216} y={220} w={150} h={44} fill={GRN} fo={0.10} stroke={GRN} sw={1} />
      <T x={291} y={238} fill={FG} size={10} weight={600}>L0 vector cache</T>
      <T x={291} y={254} size={8.5}>32 KiB · per CU</T>

      {/* CU1 mirrored */}
      <B x={480} y={112} w={340} h={168} rx={8} />
      <T x={530} y={134} size={11} fill={FG} weight={700}>CU 1</T>
      {simd(496, 146, 0)}
      {simd(656, 146, 1)}
      <B x={496} y={220} w={150} h={44} fill={BLU} fo={0.10} stroke={BLU} sw={1} />
      <T x={571} y={238} fill={FG} size={10} weight={600}>Scalar unit</T>
      <T x={571} y={254} size={8.5}>SALU + SGPRs</T>
      <B x={656} y={220} w={150} h={44} fill={GRN} fo={0.10} stroke={GRN} sw={1} />
      <T x={731} y={238} fill={FG} size={10} weight={600}>L0 vector cache</T>
      <T x={731} y={254} size={8.5}>32 KiB · per CU</T>

      {/* shared LDS + instruction caches */}
      <B x={40} y={294} w={500} h={52} fill={AMB} fo={0.12} stroke={AMB} sw={1.2} />
      <T x={290} y={316} fill={FG} size={11.5} weight={700}>LDS 128 KiB — shared by the whole WGP</T>
      <T x={290} y={334} size={9.5}>why a workgroup must fit in one WGP</T>
      <B x={556} y={294} w={264} h={52} fill={PUR} fo={0.10} stroke={PUR} sw={1} />
      <T x={688} y={316} fill={FG} size={10.5} weight={600}>L0 I-cache + scalar cache</T>
      <T x={688} y={334} size={9.5}>shared per WGP</T>

      <T x={430} y={396} size={10}>CDNA keeps the GCN layout instead: CU with 4× SIMD16, 64 KiB LDS per CU, no WGP</T>
      <T x={430} y={420} size={9.5} fill={ACC}>kernel code counts CUs (active_cu_number), not WGPs — GCN names live on</T>
    </svg>
  );
}

// ─── Figure 5: occupancy & wave slots ────────────────────────
function OccupancyWaves() {
  const slot = (i: number, filled: boolean) => (
    <g key={i}>
      <rect x={40 + (i % 8) * 46} y={96 + Math.floor(i / 8) * 34} width={40} height={26} rx={4}
        fill={filled ? GRN : "none"} fillOpacity={filled ? 0.30 : 1}
        stroke={filled ? GRN : BRD} strokeWidth={1} strokeDasharray={filled ? undefined : "3 3"} />
      {filled && <T x={60 + (i % 8) * 46} y={113 + Math.floor(i / 8) * 34} size={9} fill={FG}>w{i}</T>}
    </g>
  );
  return (
    <svg viewBox="0 0 860 430" role="img" aria-label="Occupancy: wave slots limited by vector register usage">
      <Chip x={20} y={20} w={330} label="one SIMD32 — 16 wave slots (RDNA2/3)" tone={GRN} />
      <B x={24} y={80} w={392} h={126} rx={10} />
      {Array.from({ length: 16 }, (_, i) => slot(i, i < 12))}
      <T x={220} y={228} size={10}>12 of 16 slots used → occupancy 75%</T>

      {/* VGPR budget */}
      <Chip x={470} y={20} w={300} label="what limits it? VGPR budget" tone={AMB} />
      <B x={470} y={80} w={370} h={30} rx={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={473 + i * 28.8} y={83} width={26.8} height={24} rx={3} fill={AMB} fillOpacity={0.30} stroke={AMB} strokeWidth={0.7} />
      ))}
      <T x={655} y={130} size={9.5}>VGPR file: 1536 registers / SIMD (RDNA3)</T>
      <T x={655} y={148} size={9.5}>shader needs 128 VGPRs → ⌊1536/128⌋ = 12 waves</T>
      <T x={655} y={172} size={9.5} fill={ACC}>more registers per wave ⇒ fewer waves in flight</T>
      <T x={655} y={196} size={9.5}>LDS use & workgroup size limit it the same way</T>

      {/* why it matters */}
      <B x={20} y={252} w={820} h={150} rx={8} />
      <T x={30} y={276} anchor="start" size={11} fill={FG} weight={600}>Why occupancy = latency-hiding budget</T>
      {[
        ["12 waves:", "memory stall? scheduler almost always finds a ready wave — ALUs stay busy", GRN],
        ["2 waves:", "both stalled on VRAM → SIMD idles for hundreds of cycles", ACC],
        ["but:", "occupancy is a budget, not a score — sometimes fewer waves + more VGPRs wins", MUT],
      ].map(([h, txt, tone], i) => (
        <g key={i}>
          <T x={40} y={304 + i * 30} anchor="start" size={10.5} fill={tone as string} weight={700}>{h}</T>
          <T x={130} y={304 + i * 30} anchor="start" size={10.5}>{txt}</T>
        </g>
      ))}
      <T x={430} y={392} size={9.5}>RDNA allocates SGPRs at a fixed size — on RDNA, SGPRs never limit occupancy</T>
    </svg>
  );
}

// ─── Figure 6: HIP kernel → hardware mapping ─────────────────
function HipKernelMapping() {
  return (
    <svg viewBox="0 0 860 440" role="img" aria-label="Mapping a HIP kernel launch onto AMD hardware">
      {/* code */}
      <B x={20} y={30} w={330} h={110} rx={8} fill={CARD} fo={1} />
      <T x={36} y={56} anchor="start" size={10.5} fill={FG} weight={600}>vecAdd&lt;&lt;&lt;dim3(1024),</T>
      <T x={36} y={76} anchor="start" size={10.5} fill={FG} weight={600}>         dim3(256)&gt;&gt;&gt;(a,b,c);</T>
      <T x={36} y={102} anchor="start" size={9.5}>grid  = 1024 workgroups</T>
      <T x={36} y={120} anchor="start" size={9.5}>block = 256 work-items each</T>

      {/* grid to CUs */}
      <A x1={350} y1={85} x2={410} y2={85} sw={1.4} stroke={PUR} />
      <B x={410} y={30} w={430} h={110} rx={8} />
      <Chip x={426} y={42} w={250} label="hardware spreads workgroups" tone={PUR} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <g key={i}>
          <B x={426 + i * 50} y={76} w={42} h={40} fill={PUR} fo={0.10} stroke={PUR} sw={0.9} />
          <T x={447 + i * 50} y={99} size={8.5}>WGP{i}</T>
        </g>
      ))}
      <T x={625} y={132} size={9}>any free WGP on any Shader Engine — order not guaranteed</T>

      {/* one workgroup */}
      <A x1={447} y1={116} x2={230} y2={172} sw={1.4} stroke={GRN} />
      <B x={20} y={172} w={420} h={120} rx={8} />
      <Chip x={36} y={184} w={330} label="one workgroup (256 items) on one WGP" tone={GRN} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <g key={i}>
          <B x={36 + i * 49} y={218} w={42} h={26} fill={GRN} fo={0.16} stroke={GRN} sw={0.9} />
          <T x={57 + i * 49} y={235} size={8.5} fill={FG}>wave{i}</T>
        </g>
      ))}
      <T x={230} y={266} size={9.5}>256 items ÷ wave32 = 8 wavefronts · share 128 KiB LDS · s_barrier</T>

      {/* waves to SIMD slots */}
      <A x1={440} y1={230} x2={500} y2={230} sw={1.4} stroke={ACC} />
      <B x={500} y={172} w={340} h={120} rx={8} />
      <Chip x={516} y={184} w={220} label="waves → SIMD wave slots" tone={ACC} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <B x={516 + i * 78} y={218} w={70} h={22} fill={ACC} fo={0.12} stroke={ACC} sw={0.9} />
          <T x={551 + i * 78} y={233} size={8.5}>SIMD{i}</T>
        </g>
      ))}
      <T x={670} y={262} size={9.5}>2 waves land on each of the 4 SIMD32s</T>
      <T x={670} y={280} size={9.5}>(2 SIMDs per CU × 2 CUs per WGP)</T>

      {/* index math */}
      <B x={20} y={316} w={820} h={96} rx={8} />
      <T x={30} y={340} anchor="start" size={11} fill={FG} weight={600}>Every work-item finds its data by index math:</T>
      <T x={40} y={366} anchor="start" size={10.5} fill={ACC}>i = blockIdx.x * blockDim.x + threadIdx.x</T>
      <T x={40} y={390} anchor="start" size={9.5}>lane 0 of wave 3 in block 7 → i = 7×256 + 3×32 + 0 = 1888 → c[1888] = a[1888] + b[1888]</T>
      <T x={832} y={390} anchor="end" size={9.5} fill={GRN}>32 adjacent i → 1 coalesced load</T>
    </svg>
  );
}

// ─── Figure 7: memory hierarchy ──────────────────────────────
function MemoryHierarchy() {
  const rows: Array<[string, string, string, string, string]> = [
    // name, scope, size, latency-ish, tone
    ["VGPR", "per SIMD", "1536 regs (192 KiB)", "~1 cycle", ACC],
    ["LDS", "per WGP", "128 KiB", "~20-40 cy", AMB],
    ["L0 vector", "per CU", "32 KiB", "~30 cy", GRN],
    ["L1 (gfx)", "per Shader Array", "256 KiB · RDNA4: removed", "~60 cy", GRN],
    ["L2", "whole chip", "6 MiB (Navi31)", "~100+ cy", BLU],
    ["Infinity Cache", "whole chip (MALL)", "96 MiB (Navi31)", "~150+ cy", PUR],
    ["VRAM", "off-chip", "24 GB GDDR6 · 960 GB/s", "~500+ cy", MUT],
  ];
  return (
    <svg viewBox="0 0 860 440" role="img" aria-label="AMD GPU memory hierarchy from registers to VRAM">
      {rows.map(([n, s, sz, lat, tone], i) => {
        const w = 300 + i * 62;
        const x = 430 - w / 2;
        const y = 34 + i * 50;
        return (
          <g key={n}>
            <B x={x} y={y} w={w} h={40} fill={tone} fo={0.10} stroke={tone} sw={1.1} rx={7} />
            <T x={x + 14} y={y + 25} anchor="start" size={11.5} fill={FG} weight={700}>{n}</T>
            <T x={430} y={y + 25} size={10}>{s}</T>
            <T x={x + w - 14} y={y + 25} anchor="end" size={10}>{sz}</T>
            <T x={x - 14} y={y + 25} anchor="end" size={9} fill={MUT}>{lat}</T>
          </g>
        );
      })}
      <A x1={812} y1={54} x2={812} y2={350} sw={1.2} />
      <T x={830} y={192} size={9} anchor="middle">slower</T>
      <T x={830} y={208} size={9} anchor="middle">bigger</T>
      <T x={430} y={412} size={9.5}>numbers: Radeon RX 7900 XTX (Navi 31, RDNA3) — CDNA differs: 64 KiB LDS per CU, HBM up to 5.3 TB/s, 256 MiB IC (MI300X)</T>
      <T x={430} y={430} size={9.5} fill={ACC}>driver cares less about sizes, more about coherence: what must be flushed, and when</T>
    </svg>
  );
}

// ─── Figure 8: VRAM vs GTT vs GPUVM ─────────────────────────
function VramGttGpuvm() {
  return (
    <svg viewBox="0 0 860 450" role="img" aria-label="VRAM, GTT and GPUVM address translation">
      {/* CPU side */}
      <B x={20} y={40} w={250} h={330} rx={10} />
      <Chip x={36} y={52} w={110} label="CPU side" tone={BLU} />
      <B x={40} y={86} w={210} h={120} fill={BLU} fo={0.08} stroke={BLU} />
      <T x={145} y={108} fill={FG} size={11} weight={600}>System RAM</T>
      <B x={56} y={122} w={178} h={30} fill={GRN} fo={0.18} stroke={GRN} sw={1} rx={4} />
      <T x={145} y={141} size={9.5} fill={FG}>GTT pages (GPU-visible)</T>
      <B x={56} y={160} w={178} h={30} fill={BLU} fo={0.06} stroke={BLU} sw={0.8} dash="3 3" rx={4} />
      <T x={145} y={179} size={9.5}>normal process memory</T>
      <B x={40} y={226} w={210} h={54} fill="none" stroke={BRD} />
      <T x={145} y={248} size={10.5} fill={FG} weight={600}>CPU MMU page tables</T>
      <T x={145} y={266} size={9}>per-process virtual memory</T>
      <T x={145} y={310} size={9.5}>CPU writes VRAM through</T>
      <T x={145} y={326} size={9.5}>PCIe BAR0 window ↓</T>

      {/* GPU side */}
      <B x={590} y={40} w={250} h={330} rx={10} />
      <Chip x={606} y={52} w={110} label="GPU side" tone={ACC} />
      <B x={610} y={86} w={210} h={120} fill={ACC} fo={0.08} stroke={ACC} />
      <T x={715} y={108} fill={FG} size={11} weight={600}>VRAM (local)</T>
      <B x={626} y={122} w={178} h={30} fill={ACC} fo={0.18} stroke={ACC} sw={1} rx={4} />
      <T x={715} y={141} size={9.5} fill={FG}>BOs placed in VRAM</T>
      <B x={626} y={160} w={178} h={30} fill={ACC} fo={0.06} stroke={ACC} sw={0.8} dash="3 3" rx={4} />
      <T x={715} y={179} size={9.5}>page tables also live here</T>
      <B x={610} y={226} w={210} h={54} fill="none" stroke={BRD} />
      <T x={715} y={248} size={10.5} fill={FG} weight={600}>GPU engines (CUs, SDMA)</T>
      <T x={715} y={266} size={9}>issue virtual addresses</T>
      <T x={715} y={310} size={9.5}>APU note: “VRAM” is a</T>
      <T x={715} y={326} size={9.5}>carve-out of system RAM</T>

      {/* GPUVM center */}
      <B x={310} y={86} w={240} h={194} rx={10} fill={PUR} fo={0.08} stroke={PUR} sw={1.2} />
      <T x={430} y={112} fill={FG} size={12} weight={700}>GPUVM</T>
      <T x={430} y={130} size={9.5}>per-process GPU page tables</T>
      <B x={330} y={144} w={200} h={54} fill="none" stroke={PUR} sw={0.9} />
      <T x={430} y={164} size={9.5} fill={FG}>GPU VA 0x7f00_0000</T>
      <T x={430} y={182} size={9.5}>→ VRAM page or GTT page</T>
      <T x={430} y={222} size={9.5}>GART: the kernel's own</T>
      <T x={430} y={238} size={9.5}>system-page window (GTT)</T>
      <T x={430} y={262} size={9.5} fill={ACC}>eviction moves BOs VRAM↔GTT</T>

      <A x1={550} y1={150} x2={610} y2={140} sw={1.3} stroke={ACC} />
      <A x1={310} y1={165} x2={234} y2={140} sw={1.3} stroke={GRN} />

      {/* bottom notes */}
      <B x={20} y={392} w={820} h={44} rx={8} />
      <T x={430} y={412} size={10}>amdgpu memory domains: VRAM · GTT · plus GDS / GWS / OA / DOORBELL — managed by TTM, exposed as GEM BOs</T>
      <T x={430} y={428} size={9.5} fill={ACC}>VRAM↔GTT placement & eviction is a top source of real driver bugs</T>
    </svg>
  );
}

// ─── Figure 9: command submission path ───────────────────────
function CommandSubmission() {
  return (
    <svg viewBox="0 0 860 470" role="img" aria-label="Command submission from userspace through ring buffer and command processor to compute units">
      {/* userspace lane */}
      <B x={20} y={30} w={820} h={92} rx={10} />
      <Chip x={36} y={42} w={120} label="userspace" tone={BLU} />
      <B x={180} y={48} w={190} h={56} fill={BLU} fo={0.10} stroke={BLU} />
      <T x={275} y={72} fill={FG} size={10.5} weight={600}>app + Mesa / ROCm</T>
      <T x={275} y={90} size={9}>compiles shaders, builds IBs</T>
      <B x={410} y={48} w={190} h={56} fill={BLU} fo={0.10} stroke={BLU} />
      <T x={505} y={72} fill={FG} size={10.5} weight={600}>IB (Indirect Buffer)</T>
      <T x={505} y={90} size={9}>PM4 packets in a GPU buffer</T>
      <B x={640} y={48} w={180} h={56} fill={BLU} fo={0.10} stroke={BLU} />
      <T x={730} y={72} fill={FG} size={10.5} weight={600}>ioctl(CS)</T>
      <T x={730} y={90} size={9}>submit + fences</T>
      <A x1={370} y1={76} x2={410} y2={76} sw={1.3} stroke={BLU} />
      <A x1={600} y1={76} x2={640} y2={76} sw={1.3} stroke={BLU} />

      {/* kernel lane */}
      <A x1={730} y1={104} x2={730} y2={140} sw={1.4} />
      <B x={20} y={140} w={820} h={110} rx={10} />
      <Chip x={36} y={152} w={160} label="kernel · amdgpu" tone={GRN} />
      <B x={220} y={160} w={330} h={74} fill={GRN} fo={0.08} stroke={GRN} />
      <T x={385} y={180} fill={FG} size={10.5} weight={600}>ring buffer (circular, in memory)</T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={240 + i * 29} y={192} width={25} height={18} rx={3}
          fill={i < 6 ? GRN : "none"} fillOpacity={i < 6 ? 0.30 : 1} stroke={GRN} strokeWidth={0.8} />
      ))}
      <T x={252} y={226} size={8.5}>RPTR (GPU reads)</T>
      <T x={445} y={226} size={8.5}>WPTR (driver writes)</T>
      <A x1={252} y1={216} x2={252} y2={210} sw={1} stroke={ACC} />
      <A x1={415} y1={216} x2={415} y2={210} sw={1} stroke={ACC} />
      <T x={385} y={244} size={8.5}>ring entries mostly point at IBs (INDIRECT_BUFFER packet)</T>
      <B x={600} y={160} w={220} h={74} fill={ACC} fo={0.10} stroke={ACC} sw={1.2} />
      <T x={710} y={186} fill={FG} size={11} weight={700}>doorbell write</T>
      <T x={710} y={204} size={9}>MMIO: “queue N has work”</T>
      <T x={710} y={222} size={9}>the only wake-up the GPU needs</T>
      <A x1={550} y1={197} x2={600} y2={197} sw={1.3} stroke={GRN} />

      {/* GPU lane */}
      <A x1={710} y1={234} x2={710} y2={270} sw={1.4} />
      <B x={20} y={270} w={820} h={130} rx={10} />
      <Chip x={36} y={282} w={200} label="GPU · Command Processor" tone={ACC} />
      <B x={40} y={310} w={170} h={70} fill={ACC} fo={0.10} stroke={ACC} />
      <T x={125} y={334} fill={FG} size={10.5} weight={600}>PFP → ME</T>
      <T x={125} y={352} size={9}>fetch + parse PM4</T>
      <T x={125} y={368} size={9}>(graphics queue)</T>
      <B x={230} y={310} w={170} h={70} fill={ACC} fo={0.10} stroke={ACC} />
      <T x={315} y={334} fill={FG} size={10.5} weight={600}>MEC (compute)</T>
      <T x={315} y={352} size={9}>ACE queues · MI300:</T>
      <T x={315} y={368} size={9}>4 ACEs per XCD</T>
      <B x={420} y={310} w={180} h={70} fill={PUR} fo={0.10} stroke={PUR} />
      <T x={510} y={334} fill={FG} size={10.5} weight={600}>SPI / dispatch</T>
      <T x={510} y={352} size={9}>creates wavefronts,</T>
      <T x={510} y={368} size={9}>assigns SIMD slots</T>
      <B x={620} y={310} w={200} h={70} fill="none" stroke={BRD} />
      <T x={720} y={334} fill={FG} size={10.5} weight={600}>CUs execute</T>
      <T x={720} y={352} size={9}>EOP event → fence value</T>
      <T x={720} y={368} size={9}>→ interrupt → wake waiters</T>
      <A x1={210} y1={345} x2={230} y2={345} sw={1.2} stroke={ACC} />
      <A x1={400} y1={345} x2={420} y2={345} sw={1.2} stroke={ACC} />
      <A x1={600} y1={345} x2={620} y2={345} sw={1.2} stroke={PUR} />

      {/* fence back edge */}
      <path d="M 720 380 C 720 430, 120 440, 78 404" fill="none" stroke={GRN} strokeWidth={1.2} strokeDasharray="5 4" />
      <A x1={82} y1={410} x2={74} y2={400} stroke={GRN} sw={1.2} />
      <T x={420} y={442} size={9.5} fill={GRN}>completion flows back as a fence — userspace waits on it, never polls registers</T>
    </svg>
  );
}

/* __FIGURES_10_12__ */

// ─── Figure 10: queues, MQD/HQD, MES & ACE ──────────────────
function DoorbellQueues() {
  return (
    <svg viewBox="0 0 860 440" role="img" aria-label="Queue scheduling: many MQDs mapped onto few HQD slots by MES">
      {/* many queues in memory */}
      <B x={20} y={40} w={310} h={230} rx={10} />
      <Chip x={36} y={52} w={270} label="in memory: many queues (MQDs)" tone={BLU} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <B x={40 + (i % 2) * 145} y={84 + Math.floor(i / 2) * 44} w={130} h={34}
            fill={BLU} fo={i === 2 ? 0.28 : 0.10} stroke={BLU} sw={0.9} />
          <T x={105 + (i % 2) * 145} y={98 + Math.floor(i / 2) * 44} size={9} fill={FG}>MQD — queue {i}</T>
          <T x={105 + (i % 2) * 145} y={111 + Math.floor(i / 2) * 44} size={8}>ring addr · RPTR/WPTR · state</T>
        </g>
      ))}
      <T x={175} y={258} size={9.5}>processes create far more queues than slots</T>

      {/* MES in the middle */}
      <B x={370} y={106} w={160} h={98} rx={10} fill={ACC} fo={0.10} stroke={ACC} sw={1.3} />
      <T x={450} y={134} fill={FG} size={12} weight={700}>MES / HWS</T>
      <T x={450} y={152} size={9}>scheduler firmware</T>
      <T x={450} y={170} size={9}>maps + unmaps queues,</T>
      <T x={450} y={186} size={9}>time-slices, oversubscribes</T>
      <A x1={330} y1={155} x2={370} y2={155} sw={1.4} stroke={BLU} />
      <A x1={530} y1={155} x2={570} y2={155} sw={1.4} stroke={ACC} />
      <T x={450} y={222} size={8.5}>GFX11+: MES replaces KIQ · KFD: HWS</T>

      {/* HQD slots */}
      <B x={570} y={40} w={270} h={230} rx={10} />
      <Chip x={586} y={52} w={238} label="on GPU: few HQD slots (live)" tone={ACC} />
      {[
        ["GFX pipe 0", 0, true], ["GFX pipe 1", 1, false],
        ["MEC/ACE pipe 0", 2, true], ["MEC/ACE pipe 1", 3, true],
      ].map(([label, i, live]) => (
        <g key={label as string}>
          <B x={590} y={84 + (i as number) * 42} w={230} h={32}
            fill={live ? ACC : "none"} fo={live ? 0.14 : 1}
            stroke={live ? ACC : BRD} sw={1} dash={live ? undefined : "3 3"} />
          <T x={614} y={104 + (i as number) * 42} anchor="start" size={9.5} fill={live ? FG : MUT}>{label}</T>
          <T x={796} y={104 + (i as number) * 42} anchor="end" size={8.5} fill={live ? ACC : MUT}>{live ? "HQD ← MQD" : "idle slot"}</T>
        </g>
      ))}
      <T x={705} y={258} size={9.5}>HQD = registers of an active queue</T>

      {/* doorbell flow bottom */}
      <B x={20} y={296} w={820} h={116} rx={8} />
      <T x={30} y={320} anchor="start" size={11} fill={FG} weight={600}>The doorbell ties it together:</T>
      <B x={40} y={334} w={180} h={56} fill={BLU} fo={0.10} stroke={BLU} />
      <T x={130} y={358} size={9.5} fill={FG}>process writes WPTR</T>
      <T x={130} y={374} size={9}>to its doorbell page (MMIO)</T>
      <A x1={220} y1={362} x2={280} y2={362} sw={1.3} stroke={BLU} />
      <B x={280} y={334} w={200} h={56} fill={ACC} fo={0.10} stroke={ACC} />
      <T x={380} y={358} size={9.5} fill={FG}>GPU sees queue N ready</T>
      <T x={380} y={374} size={9}>no ioctl, no interrupt needed</T>
      <A x1={480} y1={362} x2={540} y2={362} sw={1.3} stroke={ACC} />
      <B x={540} y={334} w={280} h={56} fill={GRN} fo={0.08} stroke={GRN} />
      <T x={680} y={358} size={9.5} fill={FG}>CP fetches ring → executes</T>
      <T x={680} y={374} size={9}>basis of user-mode queues (no kernel per submit)</T>
    </svg>
  );
}

// ─── Figure 11: architecture family timeline ─────────────────
function ArchTimeline() {
  const node = (x: number, y: number, l1: string, l2: string, tone: string, dash = false) => (
    <g>
      <B x={x} y={y} w={118} h={44} fill={tone} fo={dash ? 0.04 : 0.10} stroke={tone} sw={1.1} dash={dash ? "4 3" : undefined} />
      <T x={x + 59} y={y + 19} fill={FG} size={10} weight={600}>{l1}</T>
      <T x={x + 59} y={y + 35} size={8.5}>{l2}</T>
    </g>
  );
  return (
    <svg viewBox="0 0 860 400" role="img" aria-label="GCN to RDNA and CDNA architecture timeline">
      <T x={20} y={30} anchor="start" size={11.5} fill={FG} weight={700}>2012 — GCN: one architecture for everything</T>
      {node(20, 44, "GCN 1-4", "gfx6-gfx8 · wave64", MUT)}
      {node(158, 44, "GCN5 / Vega", "gfx900/906 · 2017", MUT)}
      <A x1={276} y1={66} x2={330} y2={66} sw={1.3} />

      {/* split point */}
      <line x1={330} y1={66} x2={356} y2={66} stroke={MUT} strokeWidth={1.2} />
      <path d="M 356 66 C 390 66, 380 128, 414 128" fill="none" stroke={ACC} strokeWidth={1.3} />
      <path d="M 356 66 C 390 66, 380 250, 414 250" fill="none" stroke={GRN} strokeWidth={1.3} />
      <T x={352} y={52} size={9.5} fill={ACC}>2019: the split</T>

      {/* RDNA lane */}
      <T x={20} y={118} anchor="start" size={11} fill={ACC} weight={700}>RDNA — gaming (Radeon RX)</T>
      <T x={20} y={134} anchor="start" size={9}>wave32 · WGP · Infinity Cache</T>
      {node(414, 106, "RDNA 1·2", "gfx101x/103x", ACC)}
      {node(546, 106, "RDNA 3 ·3.5", "gfx110x/115x · chiplet", ACC)}
      {node(688, 106, "RDNA 4", "gfx120x · RX 9000 · 2025", ACC)}
      <A x1={532} y1={128} x2={546} y2={128} sw={1.1} stroke={ACC} />
      <A x1={664} y1={128} x2={688} y2={128} sw={1.1} stroke={ACC} />

      {/* CDNA lane */}
      <T x={20} y={240} anchor="start" size={11} fill={GRN} weight={700}>CDNA — compute (Instinct MI)</T>
      <T x={20} y={256} anchor="start" size={9}>wave64 · matrix cores · HBM · no display</T>
      {node(414, 228, "CDNA 1·2", "gfx908/90a · MI100/200", GRN)}
      {node(546, 228, "CDNA 3", "gfx942 · MI300 · XCDs", GRN)}
      {node(688, 228, "CDNA 4", "gfx950 · MI350 · 2025", GRN)}
      <A x1={532} y1={250} x2={546} y2={250} sw={1.1} stroke={GRN} />
      <A x1={664} y1={250} x2={688} y2={250} sw={1.1} stroke={GRN} />

      {/* future */}
      {node(688, 300, "CDNA 5 · MI400", "HBM4 · 2H 2026", GRN, true)}
      <A x1={747} y1={272} x2={747} y2={300} sw={1.1} stroke={GRN} dash="3 3" />
      <T x={430} y={330} size={9.5} fill={MUT}>“UDNA”: announced strategy to re-unify RDNA+CDNA — direction, not a shipping product yet</T>

      <B x={20} y={352} w={820} h={36} rx={8} />
      <T x={430} y={374} size={9.5} fill={ACC}>kernel still speaks GCN: amdgcn LLVM triple · SE/SH/CU counting · gfx_v9/v10/v11/v12 files by GC IP version</T>
    </svg>
  );
}

// ─── Figure 12: graphics pipeline fixed-function blocks ──────
function GraphicsPipeline() {
  const stage = (x: number, w: number, l1: string, l2: string, tone: string, prog = false) => (
    <g>
      <B x={x} y={70} w={w} h={72} fill={tone} fo={prog ? 0.14 : 0.08} stroke={tone} sw={prog ? 1.4 : 1} />
      <T x={x + w / 2} y={98} fill={FG} size={10.5} weight={700}>{l1}</T>
      <T x={x + w / 2} y={116} size={8.5}>{l2}</T>
      {prog && <T x={x + w / 2} y={132} size={8} fill={ACC}>programmable</T>}
    </g>
  );
  return (
    <svg viewBox="0 0 860 380" role="img" aria-label="Fixed-function graphics pipeline blocks on AMD GPUs">
      <T x={20} y={40} anchor="start" size={11.5} fill={FG} weight={700}>One triangle's trip through the fixed-function blocks (per Shader Engine):</T>
      {stage(20, 120, "CP (gfx)", "PM4: DRAW_INDEX", ACC)}
      {stage(160, 120, "GE / PA", "fetch verts, assemble", BLU)}
      {stage(300, 130, "Rasterizer (SC)", "triangle → pixel quads", BLU)}
      {stage(450, 150, "CUs run shaders", "VS/PS waves launched", ACC, true)}
      {stage(620, 120, "RB (CB/DB)", "depth test · blend", BLU)}
      <A x1={140} y1={106} x2={160} y2={106} sw={1.2} />
      <A x1={280} y1={106} x2={300} y2={106} sw={1.2} />
      <A x1={430} y1={106} x2={450} y2={106} sw={1.2} />
      <A x1={600} y1={106} x2={620} y2={106} sw={1.2} />
      <A x1={740} y1={106} x2={772} y2={106} sw={1.2} />
      <B x={772} y={70} w={68} h={72} fill={PUR} fo={0.10} stroke={PUR} />
      <T x={806} y={100} size={9.5} fill={FG} weight={600}>L2 →</T>
      <T x={806} y={116} size={9.5} fill={FG} weight={600}>VRAM</T>

      <A x1={806} y1={142} x2={806} y2={176} sw={1.2} stroke={PUR} />
      <B x={700} y={176} w={140} h={50} fill={GRN} fo={0.08} stroke={GRN} />
      <T x={770} y={198} size={10} fill={FG} weight={600}>DCN scans out</T>
      <T x={770} y={214} size={8.5}>framebuffer → display</T>

      {/* who does what */}
      <B x={20} y={252} w={820} h={108} rx={8} />
      <T x={30} y={276} anchor="start" size={11} fill={FG} weight={600}>Who programs all this?</T>
      {[
        ["Mesa (userspace):", "compiles shaders, sets pipeline state, emits the PM4 that drives every block above", BLU],
        ["amdgpu (kernel):", "initializes blocks, manages memory + rings, schedules submissions — it never draws", ACC],
        ["so for driver work:", "know the block names + data flow; internals stay Mesa's business", MUT],
      ].map(([h, txt, tone], i) => (
        <g key={i}>
          <T x={40} y={302 + i * 24} anchor="start" size={10} fill={tone as string} weight={700}>{h}</T>
          <T x={210} y={302 + i * 24} anchor="start" size={10}>{txt}</T>
        </g>
      ))}
    </svg>
  );
}

// ─── Registry ────────────────────────────────────────────────
export const lessonFigures: Record<string, () => React.ReactNode> = {
  "cpu-vs-gpu": CpuVsGpu,
  "amd-gpu-ip-blocks": AmdGpuIpBlocks,
  "thread-hierarchy": ThreadHierarchy,
  "wgp-cu-internals": WgpCuInternals,
  "occupancy-waves": OccupancyWaves,
  "hip-kernel-mapping": HipKernelMapping,
  "memory-hierarchy": MemoryHierarchy,
  "vram-gtt-gpuvm": VramGttGpuvm,
  "command-submission": CommandSubmission,
  "doorbell-queues": DoorbellQueues,
  "arch-timeline": ArchTimeline,
  "graphics-pipeline": GraphicsPipeline,
};

export function hasLessonFigure(id?: string): boolean {
  return !!id && id in lessonFigures;
}

export function LessonFigure({ id }: { id: string }) {
  const Fig = lessonFigures[id];
  if (!Fig) return null;
  return (
    <div className="lesson-figure" data-figure-id={id}>
      <Fig />
    </div>
  );
}
