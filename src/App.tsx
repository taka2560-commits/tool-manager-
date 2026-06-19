import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  FileText,
  History,
  ExternalLink,
  Edit3,
  Save,
  Trash2,
  Clock,
  GitCommit,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check
} from 'lucide-react';

// カスタム GitHub アイコン (lucide-react 1.18.0互換用SVG)
const GithubIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ─── インターフェース定義 ───
interface HistoryItem {
  id: string;
  date: string;
  version: string;
  changes: string;
  type?: 'manual' | 'github';
  timestamp?: number;
  url?: string;
  author?: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  githubRepo: string;
  instructions: string;
  history: HistoryItem[];
}

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  toolId: string;
}

interface ConfirmDialogState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface InlineEditState {
  field: string | null;
  value: string;
}

// ─── 初期実データ (tools.json取得失敗時のフォールバック) ───
const INITIAL_TOOLS: Tool[] = [
  {
    id: 't1',
    name: '測量座標管理アプリ (Antigravity)',
    description: '測量現場で活用できる多機能な座標管理・計算ツールです。Web技術で構築されており、スマートフォンやタブレット、PCなど様々なデバイスで動作します。',
    category: 'Web App',
    url: 'https://techno-scm.vercel.app',
    githubRepo: 'taka2560-commits/Antigravity',
    instructions: '【主要機能】\n・座標管理: 登録座標の一覧表示、入力・編集、検索、IndexedDBによる保存、CSV出力\n・地図機能: Leaflet.jsを用いた座標プロット、地図からの座標登録、住所検索\n・座標計算:\n  - ST計算: 2点間の水平・傾斜距離、方位角、高低差の算出\n  - 座標変換: 緯度経度⇔平面直角座標（1系〜19系）、ヘルマート変換\n  - 標高改定対応: 国土地理院パラメータファイル(.par)による双一次内挿補正\n  - ジオイド高計算: 地理院Web API連携によるジオイド高一括取得と変換\n  - 標高系変換: T.P., O.P., K.P., N.P.の相互換算\n  - 幅杭計算: 基準線からの前進距離と左右幅から新点の連続計算・保存\n  - 真北角計算: 指定地点の真北方向角と磁北との差を算出\n  - 水準測量: レレベルブック形式入力による器械高・地盤高自動計算、PDF出力\n・建設電卓: 勾配計算、三角関数、単曲線計算、累加カウンター\n・計算履歴: ローカル自動保存と入力値の復元機能\n\n【セットアップと実行手順】\n1. コマンドラインで `c:/Users/taka/Documents/Antigravity` に移動します。\n2. `npm install` を実行して依存パッケージをインストールします。\n3. `npm run dev` を実行してローカル開発サーバーを起動します。\n4. ブラウザで `http://localhost:5173` を開いて使用します。\n\n【基本的な使い方】\n1. 「座標一覧」タブで「新規追加」をクリック、または地図上をクリックして座標を登録します。\n2. 「計算」タブで実行したい機能を選択し、登録済みの点を選択、または手動入力して計算を実行します。\n3. 計算結果は自動保存され、画面上部の履歴アイコンからいつでも復元できます。\n4. データ引き継ぎ時は「CSV出力」を活用してエクスポートします。',
    history: [{ id: 'h1', date: '2026-06-10', version: 'v2.1.0', changes: '幅杭計算（オフセット計算）機能の追加' }]
  },
  {
    id: 't2',
    name: 'webCADアプリ (Antigravity webCAD)',
    description: 'スマートデバイスやPCの両方で利用できるWebブラウザベースの2D CADアプリケーションです。測量図面や建設現場での利用に特化した設計となっています。',
    category: 'Web App',
    url: 'https://antigravity-web-cad.vercel.app',
    githubRepo: 'taka2560-commits/webCAD',
    instructions: '【主要機能】\n・DWG & DXF の高精度読み込み: WebAssembly (libredwg-web) によるブラウザ内パースと描画\n・測量座標系対応: 縦方向をX座標、横方向をY座標として扱う表示、UCS（ユーザー座標系）設定\n・スマホ最適化: 正確なスナップを可能にする「拡大鏡（ルーペ）機能」、自動フォーカス解除\n・PWA対応: ホーム画面に追加することで全画面のネイティブ風アプリとして動作\n\n【基本操作方法】\n・PC:\n  - 画面移動 (パン): マウスホイール（中ボタン）をドラッグ\n  - 拡大・縮小 (ズーム): ホイールをスクロール\n  - 範囲選択: 左から右へドラッグで「窓選択」（内包図形のみ）、右から左で「交差選択」（接触図形すべて）\n・スマートフォン / タブレット:\n  - 画面移動 (パン): 2本指でスライド\n  - 拡大・縮小 (ズーム): 2本指でピンチイン・アウト\n  - ルーペ機能: 1本指で画面を長押しスライドすると指の上に拡大ルーペが出現、指を離して決定\n\n【セットアップと実行手順】\n1. コマンドラインで `c:/Users/taka/Documents/Antigravity webCAD` に移動します。\n2. `npm install` を実行し、`npm run dev` で起動します。',
    history: [{ id: 'h2', date: '2026-03-21', version: 'v1.1.0', changes: 'WebAssembly (libredwg-web) によるAutoCAD DWGファイルの正式読み込み対応' }]
  },
  {
    id: 't3',
    name: '杭管理ツール (Antigravity 杭管理ツール)',
    description: '杭の実測完了データを管理し、棟ごとの進捗状況や毎月20日締めの月次レポートを可視化・出力するためのWebアプリケーションです。',
    category: 'Web App',
    url: 'https://kui-kanri.vercel.app',
    githubRepo: 'taka2560-commits/KUI_kanri',
    instructions: '【主要機能】\n・進捗可視化: 現場全体の合計完了・残数表示、棟別の進捗率棒グラフ（Recharts）表示\n・棟の管理: 現場内の対象棟とそれぞれの「総杭数」を登録・編集\n・実測データの連続登録: 指定した「棟」と「計測日」を固定保持し、杭名を素早く連続入力可能\n・月次レポート: 「前月21日〜当月20日」締め区切りの完了杭リスト自動集計、CSVエクスポート\n・SQLiteデータベース: データはローカルの `data/piles.db` 単一ファイルに保存\n\n【操作手順】\n1. 棟の登録: 設定画面で、あらかじめ対象となる棟の名前と総杭数を登録します。\n2. 連続計測入力: 実測完了した杭の名称（例: No.1）を計測日と棟を指定した上で連続して入力・登録します。\n3. レポートの確認: 毎月20日締めに基づいた対象月別の集計表を確認し、「CSV出力」ボタンから一括ダウンロードします。',
    history: [{ id: 'h3', date: '2026-05-20', version: 'v1.0.0', changes: '杭データ連続登録機能、毎月20日締めレポート機能、およびSQLiteデータ保存の実装' }]
  },
  {
    id: 't4',
    name: 'SiteSorter (SiteSorter)',
    description: '現場フォルダの自動整理および一元管理を行うPython製のデスクトップアプリケーションです。',
    category: 'Utility',
    url: 'c:/Users/taka/Documents/GitHub/SiteSorter',
    githubRepo: 'taka2560-commits/SiteSorter',
    instructions: '【主要機能】\n・ドラッグ＆ドロップ仕分け: デスクトップ最前面のドロップゾーンへファイルをドロップして即時仕分け\n・仕分けルール自動化: キーワード辞書・拡張子ルールに基づき自動振分\n・写真自動撮影日整理: 写真ファイル (.jpg/.jpeg) はメタデータから撮影日を判別し自動でサブフォルダを構築\n・仕分けの取り消し (Undo): 操作単位で直近5バッチまで一括で元の場所に戻すことが可能\n\n【セットアップと起動手順】\n1. `site_sorter` フォルダを作業ディレクトリに配置します。\n2. `setup.bat` をダブルクリックして仮想環境と必要ライブラリの構築、自動テストを実行します。\n3. `起動.bat` をダブルクリックして、タスクトレイ常駐およびドロップゾーンを起動させます。',
    history: [{ id: 'h4', date: '2026-06-12', version: 'v2.0.0', changes: 'フォルダ構成v2対応、PDF自動振り分けルール強化、直近50件のUndo対応' }]
  },
  {
    id: 't5',
    name: '作業日報自動入力システム (nippo-app)',
    description: '現場作業者向けの、シンプルで使いやすい作業日報入力アプリです。スマートフォンでの操作に最適化されており、PWAとして動作します。',
    category: 'Web App',
    url: 'https://nippo-app.vercel.app',
    githubRepo: 'taka2560-commits/nippo-app',
    instructions: '【主要機能】\n・簡単入力: マスタ登録された選択肢から選ぶだけで、スムーズに日報を作成\n・自動保存: 入力したデータはブラウザ内に自動的に保存\n・オフライン対応: PWAとしてインストールすれば、電波の悪い場所でもアプリを開いて入力可能\n・月報エクスポート: Excel（.xlsx）およびPDF形式で月報を出力\n\n【セットアップと実行手順】\n1. コマンドラインで `c:/Users/taka/Documents/Antigravity 日報自動入力/nippo-app` に移動します。\n2. `npm install` を実行し、`npm run dev` で起動します。',
    history: [{ id: 'h5', date: '2026-06-14', version: 'v1.0.0', changes: '初回リリース（Next.js移行、PWA対応、Excel・PDF出力の完了）' }]
  },
  {
    id: 't6',
    name: 'T-Lmail (T-Lmail)',
    description: '仕事用メールの効率化に特化した、人間主導の「AIアシスタント型」メール管理クライアントです。',
    category: 'Web App',
    url: 'https://t-lmail.vercel.app',
    githubRepo: 'taka2560-commits/t-lmail',
    instructions: '【主要機能】\n・選択的な受信（フィルタリング）: 仕事に関連するキーワードや特定の送信元からのメールのみを抽出して表示\n・AI提案・人間承認（自動仕分け）: AIがメール内容を読み、適切なラベルを提案\n・文章の添削（リライト）補助: ラフな返信案をプロフェッショナルなビジネス表現に自動調整\n\n【開発・実行ロードマップ】\n1. 基礎構築: 特定の条件に合うメールのみを抽出・表示する基盤を作成\n2. 仕分け機能の実装: ラベル案を提示・実行する確認ボタンを実装\n3. 添削機能の実装: 返信入力欄とリライト実行ボタンを実装',
    history: [{ id: 'h6', date: '2026-06-07', version: 'v0.1.0', changes: '開発計画案の作成、および「外部脳」定義ファイル（my_job_config.md）の設計完了' }]
  }
];

// ─── 操作マニュアルテキストの簡易装飾レンダラー ───
const renderInstructions = (text: string) => {
  if (!text) return <p className="text-[#DDE4D6]/50 text-xs font-medium">操作手順は登録されていません。</p>;
  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      const sizeClass = level === 1 ? 'text-base font-black mt-6 mb-4 border-b border-[#2B6A1A]/20 pb-2.5' :
                        level === 2 ? 'text-sm font-black mt-5 mb-3.5' : 'text-xs font-bold mt-4 mb-2.5';
      return <h4 key={index} className={`text-[#619224] tracking-wider flex items-center gap-2 border-l-2 border-[#619224] pl-2.5 ${sizeClass}`}>{title}</h4>;
    }
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      return <h4 key={index} className="text-[#619224] font-black text-sm tracking-wider mt-5 mb-3.5 first:mt-0 flex items-center gap-2 border-l-2 border-[#619224] pl-2.5">{trimmed.slice(1, -1)}</h4>;
    }
    if (line.match(/^(\s*)(\d+\.|-|\*)\s+/)) {
      return <p key={index} className="text-[#DDE4D6]/90 text-[13px] leading-relaxed pl-5 -indent-5 mb-2.5 font-medium">{line}</p>;
    }
    if (trimmed === '') return <div key={index} className="h-3" />;
    return <p key={index} className="text-[#DDE4D6]/90 text-[13px] leading-relaxed mb-2 font-medium">{line}</p>;
  });
};

// ─── [1] Tooltip コンポーネント ───
const Tooltip = ({ text, children, position = 'bottom' }: { text: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const posClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];
  return (
    <div className="relative group/tip">
      {children}
      <div className={`absolute ${posClass} px-2.5 py-1.5 bg-[#2A2E25] text-[#DDE4D6] text-[10px] font-bold rounded-lg border border-[#2B6A1A]/40 shadow-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-200 z-50`}>
        {text}
      </div>
    </div>
  );
};

// ─── [2] Skeleton コンポーネント ───
const Skeleton = ({ lines = 5, className = '' }: { lines?: number; className?: string }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3 bg-[#2B6A1A]/15 rounded-md" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#2A2E25] p-5 rounded-2xl border border-[#2B6A1A]/15">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-20 bg-[#2B6A1A]/15 rounded" />
      <div className="h-3 w-16 bg-[#2B6A1A]/10 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[#2B6A1A]/12 rounded w-full" />
      <div className="h-3 bg-[#2B6A1A]/10 rounded w-3/4" />
    </div>
  </div>
);

// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  // ─── 既存ステート ───
  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('tool_manager_tools');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Failed to parse tools from localStorage', e); }
    }
    return INITIAL_TOOLS;
  });

  const [selectedToolId, setSelectedToolId] = useState<string | null>(() => {
    const saved = localStorage.getItem('tool_manager_tools');
    if (saved) {
      try { const parsed = JSON.parse(saved); if (parsed.length > 0) return parsed[0].id; } catch (e) {}
    }
    return INITIAL_TOOLS[0].id;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<string>('view');
  const [activeTab, setActiveTab] = useState<string>('instructions');
  const [commitsCache, setCommitsCache] = useState<Record<string, HistoryItem[]>>({});
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [dynamicReadmes, setDynamicReadmes] = useState<Record<string, string>>({});
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const [toolStatuses, setToolStatuses] = useState<Record<string, 'active' | 'offline' | 'local' | 'checking'>>({});
  const [formData, setFormData] = useState<Tool | null>(null);
  const [newHistory, setNewHistory] = useState({ date: new Date().toISOString().split('T')[0], version: '', changes: '' });

  // ─── 新規ステート: 12 UIコンポーネント ───
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ show: false, x: 0, y: 0, toolId: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [inlineEdit, setInlineEdit] = useState<InlineEditState>({ field: null, value: '' });
  const [commandQuery, setCommandQuery] = useState('');

  const commandInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // ─── LocalStorage永続化 ───
  useEffect(() => { localStorage.setItem('tool_manager_tools', JSON.stringify(tools)); }, [tools]);

  // ─── リモートtools.json新規ツール自動追加 ───
  useEffect(() => {
    const fetchRemoteTools = async () => {
      try {
        const res = await fetch('/tools.json');
        if (!res.ok) return;
        const remoteTools: Tool[] = await res.json();
        setTools(current => {
          const currentIds = new Set(current.map(t => t.id));
          const newTools = remoteTools.filter(t => !currentIds.has(t.id));
          if (newTools.length === 0) return current;
          return [...current, ...newTools];
        });
      } catch (e) { console.error('Failed to fetch remote tools', e); }
    };
    fetchRemoteTools();
  }, []);

  // ─── [1] Toast通知システム ───
  const addToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ─── [2] コマンドパレット: Ctrl+K ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        setCommandQuery('');
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setContextMenu(prev => ({ ...prev, show: false }));
        setShowExportMenu(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [showCommandPalette]);

  // ─── コンテキストメニュー閉じる ───
  useEffect(() => {
    const handler = () => {
      setContextMenu(prev => ({ ...prev, show: false }));
      setShowExportMenu(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // ─── フィルタ & 検索 ───
  const categories = useMemo(() => [...new Set(tools.map(t => t.category))], [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, categoryFilter]);

  const selectedTool = tools.find(t => t.id === selectedToolId);

  // コマンドパレット用フィルタ
  const commandResults = useMemo(() => {
    if (!commandQuery) return tools;
    return tools.filter(t =>
      t.name.toLowerCase().includes(commandQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(commandQuery.toLowerCase())
    );
  }, [tools, commandQuery]);

  // ─── ツール操作ハンドラ ───
  const handleSelectTool = (id: string) => {
    setSelectedToolId(id);
    setMode('view');
    setActiveTab('instructions');
    setInlineEdit({ field: null, value: '' });
  };

  const handleStartAdd = () => {
    setFormData({ id: '', name: '', description: '', category: 'Web App', url: '', githubRepo: '', instructions: '', history: [] });
    setMode('add_tool');
  };

  const handleStartEdit = () => {
    if (selectedTool) {
      setFormData({ ...selectedTool });
      setMode('edit_tool');
    }
  };

  const handleSaveTool = () => {
    if (!formData) return;
    if (!formData.name.trim()) { addToast('ツール名を入力してください', 'error'); return; }
    if (mode === 'add_tool') {
      const newTool: Tool = { ...formData, id: `t${Date.now()}`, history: [{ id: `h${Date.now()}`, date: new Date().toISOString().split('T')[0], version: '1.0.0', changes: 'ツール登録' }] };
      setTools([newTool, ...tools]);
      setSelectedToolId(newTool.id);
      addToast(`${newTool.name} を登録しました`, 'success');
    } else {
      setTools(tools.map(t => t.id === formData.id ? formData : t));
      addToast('変更を保存しました', 'success');
    }
    setMode('view');
  };

  // [3] 確認ダイアログ付き削除
  const handleDeleteTool = () => {
    if (!selectedTool) return;
    setConfirmDialog({
      show: true,
      title: 'ツールの削除',
      message: `「${selectedTool.name}」を削除しますか？この操作は取り消せません。`,
      onConfirm: () => {
        const name = selectedTool.name;
        const newTools = tools.filter(t => t.id !== selectedToolId);
        setTools(newTools);
        setSelectedToolId(newTools.length > 0 ? newTools[0].id : null);
        setMode('view');
        setConfirmDialog(prev => ({ ...prev, show: false }));
        addToast(`${name} を削除しました`, 'info');
      }
    });
  };

  const handleAddHistory = () => {
    if (!selectedTool || !newHistory.changes.trim()) return;
    const updatedTool: Tool = {
      ...selectedTool,
      history: [{ id: `h${Date.now()}`, ...newHistory }, ...(selectedTool.history || [])]
    };
    setTools(tools.map(t => t.id === selectedTool.id ? updatedTool : t));
    setNewHistory({ date: new Date().toISOString().split('T')[0], version: '', changes: '' });
    addToast('履歴を追加しました', 'success');
  };

  // ─── [4] インライン編集 ───
  const startInlineEdit = (field: string, currentValue: string) => {
    setInlineEdit({ field, value: currentValue });
  };

  const saveInlineEdit = () => {
    if (!selectedTool || !inlineEdit.field) return;
    const updated = { ...selectedTool, [inlineEdit.field]: inlineEdit.value };
    setTools(tools.map(t => t.id === selectedTool.id ? updated : t));
    setInlineEdit({ field: null, value: '' });
    addToast('更新しました', 'success');
  };

  const cancelInlineEdit = () => setInlineEdit({ field: null, value: '' });

  // ─── [5] エクスポート機能 ───
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tools, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tools.json'; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    addToast('JSONファイルを出力しました', 'success');
  };

  const exportCSV = () => {
    const header = 'name,category,url,githubRepo,description';
    const rows = tools.map(t => `"${t.name}","${t.category}","${t.url}","${t.githubRepo}","${t.description.replace(/"/g, '""')}"`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tools.csv'; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    addToast('CSVファイルを出力しました', 'success');
  };

  const copyToolData = (tool: Tool) => {
    navigator.clipboard.writeText(JSON.stringify(tool, null, 2));
    addToast('クリップボードにコピーしました', 'success');
  };

  // ─── GitHub APIからのコミット履歴データ取得 ───
  useEffect(() => {
    if (activeTab === 'history' && selectedTool?.githubRepo) {
      const repo = selectedTool.githubRepo;
      if (commitsCache[repo]) return;
      const fetchCommits = async () => {
        setIsLoadingCommits(true);
        setCommitError(null);
        try {
          const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`);
          if (!response.ok) throw new Error(response.status === 404 ? 'リポジトリが見つかりません' : 'コミット履歴の取得に失敗しました');
          const data = await response.json();
          const formattedCommits: HistoryItem[] = data.map((c: any) => ({
            id: c.sha, type: 'github', date: c.commit.author.date.split('T')[0],
            timestamp: new Date(c.commit.author.date).getTime(), version: c.sha.substring(0, 7),
            changes: c.commit.message, url: c.html_url, author: c.commit.author.name
          }));
          setCommitsCache(prev => ({ ...prev, [repo]: formattedCommits }));
        } catch (err: any) { setCommitError(err.message); }
        finally { setIsLoadingCommits(false); }
      };
      fetchCommits();
    }
  }, [activeTab, selectedTool?.githubRepo, commitsCache]);

  // ─── GitHub APIからの README 取得 ───
  useEffect(() => {
    if (activeTab === 'instructions' && selectedTool?.githubRepo) {
      const repo = selectedTool.githubRepo;
      const toolId = selectedTool.id;
      if (dynamicReadmes[toolId]) return;
      const fetchReadme = async () => {
        setIsLoadingReadme(true);
        try {
          const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
          if (!response.ok) throw new Error('READMEの同期に失敗しました');
          const data = await response.json();
          const decoded = decodeURIComponent(escape(window.atob(data.content.replace(/\s/g, ''))));
          setDynamicReadmes(prev => ({ ...prev, [toolId]: decoded }));
        } catch (err: any) { console.error(err.message); }
        finally { setIsLoadingReadme(false); }
      };
      fetchReadme();
    }
  }, [activeTab, selectedToolId, selectedTool?.githubRepo, dynamicReadmes]);

  // ─── ヘルスチェック ───
  useEffect(() => {
    const checkStatuses = async () => {
      const newStatuses = { ...toolStatuses };
      let changed = false;
      for (const tool of tools) {
        if (!tool.url) { if (newStatuses[tool.id] !== 'local') { newStatuses[tool.id] = 'local'; changed = true; } continue; }
        const isWebUrl = tool.url.startsWith('http://') || tool.url.startsWith('https://');
        if (!isWebUrl) { if (newStatuses[tool.id] !== 'local') { newStatuses[tool.id] = 'local'; changed = true; } continue; }
        if (newStatuses[tool.id] === 'active' || newStatuses[tool.id] === 'offline') continue;
        newStatuses[tool.id] = 'checking'; setToolStatuses({ ...newStatuses });
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          await fetch(tool.url, { method: 'GET', mode: 'no-cors', signal: controller.signal });
          clearTimeout(timeoutId);
          newStatuses[tool.id] = 'active';
        } catch (e) { newStatuses[tool.id] = 'offline'; }
        changed = true;
      }
      if (changed) setToolStatuses({ ...newStatuses });
    };
    checkStatuses();
  }, [tools]);

  // ─── 統合履歴 ───
  const combinedHistory = useMemo(() => {
    if (!selectedTool) return [];
    const manualHistory: HistoryItem[] = (selectedTool.history || []).map(h => ({ ...h, type: 'manual', timestamp: new Date(h.date).getTime() }));
    const githubHistory = commitsCache[selectedTool?.githubRepo] || [];
    return [...manualHistory, ...githubHistory].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [selectedTool, commitsCache]);

  // ─── [6] バッジ・タグ: ステータスバッジ ───
  const getStatusBadge = (id: string) => {
    const status = toolStatuses[id] || 'local';
    const config = {
      checking: { label: '確認中', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      active: { label: '稼働中', bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
      offline: { label: '停止', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
      local: { label: 'ローカル', bg: 'bg-[#DDE4D6]/8', text: 'text-[#DDE4D6]/50', border: 'border-[#DDE4D6]/15' },
    }[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-400' : status === 'offline' ? 'bg-red-400' : status === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-[#DDE4D6]/30'}`} />
        {config.label}
      </span>
    );
  };

  const getStatusDot = (id: string) => {
    const status = toolStatuses[id] || 'local';
    if (status === 'checking') return <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shrink-0" />;
    if (status === 'active') return <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] shrink-0" />;
    if (status === 'offline') return <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] shrink-0" />;
    return <span className="w-2 h-2 rounded-full bg-[#DDE4D6]/20 shrink-0" />;
  };

  // ─── [7] 統計カード ───
  const stats = useMemo(() => {
    const active = Object.values(toolStatuses).filter(s => s === 'active').length;
    const total = tools.length;
    const latestUpdate = tools.reduce((latest, t) => {
      const h = t.history?.[0];
      return h && h.date > latest ? h.date : latest;
    }, '');
    return { total, active, latestUpdate };
  }, [tools, toolStatuses]);

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
  return (
    <div className="flex h-screen bg-[#1D201A] font-sans text-[#DDE4D6]">
      {/* ─── サイドバー ─── */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-[#151713]/90 backdrop-blur-lg border-r border-[#2B6A1A]/20 flex flex-col h-screen transition-all duration-300 relative`}>
        {/* 折りたたみトグル */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 z-30 w-6 h-6 bg-[#2A2E25] border border-[#2B6A1A]/40 rounded-full flex items-center justify-center text-[#DDE4D6]/60 hover:text-[#DDE4D6] hover:bg-[#2B6A1A]/50 transition-all duration-200 shadow-md"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* ヘッダー */}
        <div className={`p-5 border-b border-[#2B6A1A]/20 bg-[#1F221C]/60 ${sidebarCollapsed ? 'px-3' : ''}`}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <FolderGit2 className="text-[#619224] w-6 h-6" />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-[#DDE4D6] flex items-center gap-2.5 mb-3 tracking-tight">
                <FolderGit2 className="text-[#619224] w-6 h-6 shrink-0" />
                ツールマネージャー
              </h1>

              {/* [7] 統計カード */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-[#151713]/80 rounded-lg px-2.5 py-1.5 border border-[#2B6A1A]/20 text-center">
                  <div className="text-sm font-black text-[#DDE4D6]">{stats.total}</div>
                  <div className="text-[8px] font-bold text-[#DDE4D6]/40 uppercase tracking-wider">ツール</div>
                </div>
                <div className="flex-1 bg-[#151713]/80 rounded-lg px-2.5 py-1.5 border border-[#2B6A1A]/20 text-center">
                  <div className="text-sm font-black text-green-400">{stats.active}</div>
                  <div className="text-[8px] font-bold text-[#DDE4D6]/40 uppercase tracking-wider">稼働</div>
                </div>
                <div className="flex-1 bg-[#151713]/80 rounded-lg px-2.5 py-1.5 border border-[#2B6A1A]/20 text-center">
                  <div className="text-[10px] font-bold text-[#DDE4D6]/70">{stats.latestUpdate ? stats.latestUpdate.slice(5) : '--'}</div>
                  <div className="text-[8px] font-bold text-[#DDE4D6]/40 uppercase tracking-wider">最終更新</div>
                </div>
              </div>

              {/* 検索 */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-3 text-[#DDE4D6]/35 w-4 h-4 transition-colors group-focus-within:text-[#619224]" />
                <input
                  type="text"
                  placeholder="検索... (Ctrl+K)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151713]/80 border border-[#2B6A1A]/40 rounded-xl text-sm text-[#DDE4D6] placeholder-[#DDE4D6]/30 focus:outline-none focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (window.innerWidth < 1024) setShowCommandPalette(true); }}
                />
              </div>

              {/* [6] フィルターチップ */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 border ${
                      !categoryFilter
                        ? 'bg-[#619224]/25 text-[#619224] border-[#619224]/40'
                        : 'bg-transparent text-[#DDE4D6]/40 border-[#2B6A1A]/15 hover:text-[#DDE4D6]/60 hover:border-[#2B6A1A]/30'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 border ${
                        categoryFilter === cat
                          ? 'bg-[#803DF5]/20 text-[#803DF5] border-[#803DF5]/40'
                          : 'bg-transparent text-[#DDE4D6]/40 border-[#2B6A1A]/15 hover:text-[#DDE4D6]/60 hover:border-[#2B6A1A]/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ツールリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sidebarCollapsed ? (
            // アイコンのみ表示
            filteredTools.map(tool => (
              <Tooltip key={tool.id} text={tool.name} position="right">
                <button
                  onClick={() => handleSelectTool(tool.id)}
                  className={`w-full p-2 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    selectedToolId === tool.id && mode !== 'add_tool'
                      ? 'bg-[#2B6A1A]/85 border border-[#619224]/40'
                      : 'hover:bg-[#2B6A1A]/20 border border-transparent'
                  }`}
                >
                  {getStatusDot(tool.id)}
                </button>
              </Tooltip>
            ))
          ) : (
            filteredTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ show: true, x: e.clientX, y: e.clientY, toolId: tool.id });
                }}
                className={`relative w-full text-left px-5 py-4 rounded-xl transition-all duration-300 active:scale-[0.98] ${
                  selectedToolId === tool.id && mode !== 'add_tool'
                    ? 'bg-[#2B6A1A]/85 text-[#DDE4D6] shadow-[0_4px_16px_rgba(43,106,26,0.25)] border border-[#619224]/40 font-bold'
                    : 'bg-[#1F221C]/45 hover:bg-[#2B6A1A]/20 border border-[#2B6A1A]/10 text-[#DDE4D6]/60 hover:text-[#DDE4D6] shadow-sm'
                }`}
              >
                {selectedToolId === tool.id && mode !== 'add_tool' && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-[#619224] rounded-r-md" />
                )}
                <div className="flex items-center gap-2.5">
                  {getStatusDot(tool.id)}
                  <div className="truncate flex-1 text-sm">{tool.name}</div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 pl-4.5">
                  <span className={`text-[10px] font-extrabold tracking-wider uppercase ${selectedToolId === tool.id && mode !== 'add_tool' ? 'text-[#DDE4D6]/80' : 'text-[#DDE4D6]/40'}`}>
                    {tool.category}
                  </span>
                  {/* [6] バッジ */}
                  {getStatusBadge(tool.id)}
                </div>
              </button>
            ))
          )}
          {filteredTools.length === 0 && !sidebarCollapsed && (
            <div className="text-center text-[#DDE4D6]/40 text-sm mt-12 py-8 bg-[#1F221C]/25 rounded-2xl border border-[#2B6A1A]/10 border-dashed">
              見つかりませんでした
            </div>
          )}
        </div>

        {/* フッター: 新規追加 + エクスポート */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-[#2B6A1A]/20 bg-[#1F221C]/60 space-y-2">
            <button
              onClick={handleStartAdd}
              className="w-full bg-[#803DF5]/10 hover:bg-[#803DF5]/20 text-[#803DF5] font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-[#803DF5]/25 hover:border-[#803DF5]/50 active:scale-[0.97]"
            >
              <Plus className="w-5 h-5" />
              新規ツール登録
            </button>

            {/* [5] エクスポートメニュー */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                className="w-full text-[#DDE4D6]/50 hover:text-[#DDE4D6]/80 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-xs border border-[#2B6A1A]/10 hover:border-[#2B6A1A]/30 hover:bg-[#2B6A1A]/10"
              >
                <Download className="w-3.5 h-3.5" />
                エクスポート
              </button>
              {showExportMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#2A2E25] border border-[#2B6A1A]/40 rounded-xl shadow-xl overflow-hidden z-40 animate-fade-in">
                  <button onClick={exportJSON} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2 transition-colors">
                    <Download className="w-3.5 h-3.5 text-[#619224]" /> JSON (.json)
                  </button>
                  <button onClick={exportCSV} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2 transition-colors border-t border-[#2B6A1A]/15">
                    <Download className="w-3.5 h-3.5 text-[#619224]" /> CSV (.csv)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── メインコンテンツ ─── */}
      {mode === 'view' ? (
        // ── ビューモード ──
        !selectedTool ? (
          <div className="flex-1 flex items-center justify-center text-[#DDE4D6]/40 bg-[#151713]/90 font-medium relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'url(/meridian-silence.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <span className="relative z-10">ツールが選択されていません</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1D201A] animate-fade-in relative">
            {/* ヘッダー */}
            <div className="px-8 py-8 border-b border-[#2B6A1A]/20 bg-gradient-to-b from-[#151713]/90 to-[#232720]/45 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-[#2B6A1A]/25 text-[#DDE4D6]/90 rounded-full text-[10px] font-black tracking-wider uppercase border border-[#2B6A1A]/40 shadow-sm">
                      {selectedTool.category}
                    </span>
                    {getStatusBadge(selectedTool.id)}
                  </div>

                  {/* [4] インライン編集: ツール名 */}
                  {inlineEdit.field === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={inlineEdit.value}
                        onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') saveInlineEdit(); if (e.key === 'Escape') cancelInlineEdit(); }}
                        className="text-3xl font-black text-[#DDE4D6] bg-transparent border-b-2 border-[#619224] outline-none w-full"
                      />
                      <button onClick={saveInlineEdit} className="p-1 text-green-400 hover:bg-green-500/10 rounded-lg"><Check className="w-5 h-5" /></button>
                      <button onClick={cancelInlineEdit} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <h2
                      className="text-3xl font-black text-[#DDE4D6] tracking-tight cursor-pointer hover:text-[#619224] transition-colors group/name"
                      onClick={() => startInlineEdit('name', selectedTool.name)}
                    >
                      {selectedTool.name}
                      <Edit3 className="w-4 h-4 inline ml-2 opacity-0 group-hover/name:opacity-50 transition-opacity" />
                    </h2>
                  )}
                </div>

                <div className="flex gap-2.5 shrink-0 ml-4">
                  <Tooltip text="全項目を編集">
                    <button onClick={handleStartEdit} className="px-3.5 py-2 text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/35 hover:text-[#DDE4D6] rounded-xl flex items-center gap-2 transition-all duration-300 border border-[#2B6A1A]/10 hover:border-[#2B6A1A]/40 active:scale-95 shadow-sm">
                      <Edit3 className="w-4 h-4" /> <span className="text-xs font-bold">編集</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="JSONをコピー">
                    <button onClick={() => copyToolData(selectedTool)} className="p-2 text-[#DDE4D6]/50 hover:bg-[#2B6A1A]/25 hover:text-[#DDE4D6] rounded-xl transition-all duration-300 border border-transparent hover:border-[#2B6A1A]/20 active:scale-95">
                      <Copy className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text="ツールを削除">
                    <button onClick={handleDeleteTool} className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/20 active:scale-95 shadow-sm">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* [4] インライン編集: 説明 */}
              {inlineEdit.field === 'description' ? (
                <div className="flex items-start gap-2">
                  <textarea
                    autoFocus
                    value={inlineEdit.value}
                    onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Escape') cancelInlineEdit(); }}
                    rows={2}
                    className="flex-1 text-base text-[#DDE4D6]/90 bg-transparent border border-[#619224]/40 rounded-lg p-2 outline-none resize-none"
                  />
                  <button onClick={saveInlineEdit} className="p-1 mt-1 text-green-400 hover:bg-green-500/10 rounded-lg"><Check className="w-4 h-4" /></button>
                  <button onClick={cancelInlineEdit} className="p-1 mt-1 text-red-400 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <p
                  className="text-[#DDE4D6]/70 text-base leading-relaxed max-w-4xl font-medium cursor-pointer hover:text-[#DDE4D6]/90 transition-colors group/desc"
                  onClick={() => startInlineEdit('description', selectedTool.description)}
                >
                  {selectedTool.description}
                  <Edit3 className="w-3 h-3 inline ml-1.5 opacity-0 group-hover/desc:opacity-40 transition-opacity" />
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedTool.url && (
                  <div className="flex items-center gap-2 text-[#619224] bg-[#619224]/10 border border-[#619224]/20 px-3.5 py-2 rounded-xl max-w-full shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold truncate select-all">{selectedTool.url}</span>
                  </div>
                )}
                {selectedTool.githubRepo && (
                  <div className="flex items-center gap-2 text-[#DDE4D6]/80 bg-[#2B6A1A]/15 border border-[#2B6A1A]/30 px-3.5 py-2 rounded-xl max-w-full shadow-sm">
                    <GithubIcon className="w-3.5 h-3.5 shrink-0 text-[#619224]" />
                    <span className="text-xs font-semibold truncate select-all">{selectedTool.githubRepo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* タブ */}
            <div className="px-8 flex gap-8 border-b border-[#2B6A1A]/20 bg-[#232720]">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`py-4 flex items-center gap-2 font-bold text-sm transition-all duration-300 relative active:scale-95 ${
                  activeTab === 'instructions' ? 'text-[#619224]' : 'text-[#DDE4D6]/40 hover:text-[#DDE4D6]/70'
                }`}
              >
                <FileText className="w-4 h-4" /> 概要・操作手順
                {activeTab === 'instructions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#619224] rounded-t-full shadow-[0_-2px_8px_rgba(97,146,36,0.4)]" />}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 flex items-center gap-2 font-bold text-sm transition-all duration-300 relative active:scale-95 ${
                  activeTab === 'history' ? 'text-[#619224]' : 'text-[#DDE4D6]/40 hover:text-[#DDE4D6]/70'
                }`}
              >
                <History className="w-4 h-4" /> 更新履歴
                {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#619224] rounded-t-full shadow-[0_-2px_8px_rgba(97,146,36,0.4)]" />}
              </button>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#151713] transition-all duration-300 flex flex-col items-start justify-start relative">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'url(/meridian-silence.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
              {activeTab === 'instructions' ? (
                <div className="w-full max-w-5xl bg-[#2A2E25]/95 p-8 rounded-2xl border border-[#2B6A1A]/25 shadow-md animate-fade-in relative z-10 backdrop-blur-sm">
                  <h3 className="text-lg font-black mb-5 text-[#DDE4D6] flex justify-between items-center border-b border-[#2B6A1A]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#619224]" />
                      操作マニュアル
                    </div>
                    {dynamicReadmes[selectedTool.id] && (
                      <span className="text-[9px] uppercase font-black tracking-wider bg-[#2B6A1A]/35 text-[#DDE4D6]/85 px-2 py-0.5 rounded-md border border-[#2B6A1A]/40 flex items-center gap-1.5 shadow-sm">
                        <GithubIcon className="w-3 h-3 text-[#619224]" /> GitHubから同期済み
                      </span>
                    )}
                  </h3>
                  {/* [2] スケルトンローディング */}
                  {isLoadingReadme ? (
                    <div className="bg-[#151713]/80 p-6 rounded-xl border border-[#2B6A1A]/15 shadow-inner">
                      <Skeleton lines={8} />
                    </div>
                  ) : (
                    <div className="bg-[#151713]/80 p-6 rounded-xl border border-[#2B6A1A]/15 shadow-inner">
                      {renderInstructions(dynamicReadmes[selectedTool.id] || selectedTool.instructions)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-5xl animate-fade-in relative z-10">
                  {/* 履歴追加フォーム */}
                  <div className="bg-[#2A2E25] p-6 rounded-2xl border border-[#2B6A1A]/20 shadow-md mb-8">
                    <h4 className="text-sm font-black text-[#DDE4D6] mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#619224]" /> 新しい履歴を手動で記録
                    </h4>
                    <div className="flex flex-wrap md:flex-nowrap gap-3">
                      <input type="date" value={newHistory.date} onChange={e => setNewHistory({...newHistory, date: e.target.value})} className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 rounded-xl px-4 py-2.5 text-xs w-full md:w-44 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all [color-scheme:dark]" />
                      <input type="text" placeholder="Version (例: v1.1)" value={newHistory.version} onChange={e => setNewHistory({...newHistory, version: e.target.value})} className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl px-4 py-2.5 text-xs w-full md:w-36 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" />
                      <input type="text" placeholder="変更内容を入力..." value={newHistory.changes} onChange={e => setNewHistory({...newHistory, changes: e.target.value})} className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl px-4 py-2.5 text-xs flex-1 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" />
                      <button onClick={handleAddHistory} className="bg-[#619224] hover:bg-[#2B6A1A] text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 active:scale-95 shadow-md shadow-[#619224]/10 w-full md:w-auto">追加</button>
                    </div>
                  </div>

                  {/* 履歴タイムライン (スケルトン対応) */}
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#2B6A1A]/30 before:via-[#2B6A1A]/30 before:to-transparent">
                    {isLoadingCommits && (
                      <div className="space-y-4 relative z-10">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                      </div>
                    )}
                    {commitError && (
                      <div className="text-center py-4 px-6 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/15 rounded-xl mb-6 relative z-10 animate-fade-in">
                        {commitError}
                      </div>
                    )}
                    {combinedHistory.map((item, index) => (
                      <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in" style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#151713] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110 ${
                          item.type === 'github' ? 'bg-[#2B6A1A] text-[#DDE4D6]' : 'bg-[#619224]/10 text-[#619224] border-2 border-[#619224]/30'
                        }`}>
                          {item.type === 'github' ? <GithubIcon className="w-4.5 h-4.5" /> : <Clock className="w-4.5 h-4.5" />}
                        </div>
                        <div className={`w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-[#2A2E25] p-5 rounded-2xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] ${
                          item.type === 'github' ? 'border-[#2B6A1A]/20 hover:border-[#2B6A1A]/50' : 'border-[#619224]/20 hover:border-[#619224]/50 ring-1 ring-[#619224]/5 hover:ring-[#619224]/10'
                        }`}>
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#DDE4D6] text-sm">{item.version || 'Update'}</span>
                              {item.type === 'github' && (
                                <span className="text-[9px] uppercase font-black tracking-wider bg-[#2B6A1A]/35 text-[#DDE4D6]/80 px-2 py-0.5 rounded-md border border-[#2B6A1A]/40 flex items-center gap-1">
                                  <GitCommit className="w-2.5 h-2.5 text-[#619224]" /> Commit
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#DDE4D6]/50 bg-[#151713] border border-[#2B6A1A]/20 px-2.5 py-0.5 rounded-full">{item.date}</span>
                          </div>
                          <p className="text-[#DDE4D6]/90 text-xs whitespace-pre-wrap leading-relaxed font-semibold">{item.changes}</p>
                          {item.type === 'github' && (
                            <div className="mt-4 pt-3 border-t border-[#2B6A1A]/15 flex items-center justify-between text-[10px] font-bold text-[#DDE4D6]/40">
                              <span className="flex items-center gap-1.5">
                                <span className="w-4 h-4 bg-[#2B6A1A]/40 rounded-full flex items-center justify-center text-[7px] text-[#DDE4D6]">&#x1F464;</span>
                                {item.author}
                              </span>
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#803DF5] hover:text-[#803DF5]/80 hover:underline flex items-center gap-1 transition-all duration-200">
                                GitHubで見る <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {combinedHistory.length === 0 && !isLoadingCommits && (
                      <div className="text-[#DDE4D6]/40 text-center py-12 bg-[#2A2E25] rounded-2xl border border-[#2B6A1A]/10 border-dashed relative z-10">
                        履歴はまだありません
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        // ── 編集/追加モード ──
        formData && (
          <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#151713] animate-fade-in">
            <div className="px-8 py-5 border-b border-[#2B6A1A]/20 bg-[#232720]/80 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-sm">
              <h2 className="text-2xl font-black text-[#DDE4D6] tracking-tight">
                {mode === 'add_tool' ? '新規ツールの登録' : 'ツール情報の編集'}
              </h2>
              <div className="flex gap-2.5">
                <button onClick={() => setMode('view')} className="px-5 py-2 text-[#DDE4D6]/60 hover:bg-[#2B6A1A]/15 hover:text-[#DDE4D6] rounded-xl text-xs font-bold transition-all duration-300">キャンセル</button>
                <button onClick={handleSaveTool} className="px-6 py-2 bg-[#619224] hover:bg-[#2B6A1A] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all duration-300 active:scale-95 shadow-md shadow-[#619224]/10">
                  <Save className="w-4 h-4" /> 保存する
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto bg-[#2A2E25] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.25)] border border-[#2B6A1A]/20 p-8 space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">ツール名 <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" placeholder="例: 画像リサイズツール" />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">カテゴリ</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" placeholder="例: Web App, CLI, Script" />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">URL / パス</label>
                    <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" placeholder="例: https://..., C:/scripts/..." />
                  </div>
                </div>
                <div className="bg-[#151713]/80 p-5 rounded-2xl border border-[#2B6A1A]/20">
                  <label className="flex items-center gap-2 text-xs font-black text-[#DDE4D6]/80 mb-2.5 uppercase tracking-wider">
                    <GithubIcon className="w-4.5 h-4.5 text-[#619224]" /> GitHubリポジトリ (任意)
                  </label>
                  <input type="text" value={formData.githubRepo || ''} onChange={e => setFormData({...formData, githubRepo: e.target.value})} className="w-full bg-[#1F221C] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all" placeholder="例: facebook/react" />
                  <p className="text-[10px] text-[#DDE4D6]/40 mt-2 font-bold leading-normal">
                    <code className="bg-[#2B6A1A]/35 px-1.5 py-0.5 rounded text-[#DDE4D6]/70 font-semibold">owner/repo</code> 形式で入力すると、履歴タブを開いた際に最新のコミットログが自動的に表示されます。
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">概要・説明</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none resize-none transition-all" placeholder="ツールが何をするものか簡単な説明を記載" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">操作手順・マニュアル</label>
                  <div className="border border-[#2B6A1A]/40 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#619224]/30 focus-within:border-[#619224] transition-all">
                    <div className="bg-[#151713]/80 border-b border-[#2B6A1A]/40 p-3.5 text-[10px] font-bold text-[#DDE4D6]/50">
                      プレーンテキストで記述できます。箇条書きなどで分かりやすく記載してください。
                    </div>
                    <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} rows={8} className="w-full p-4 bg-[#1F221C]/75 text-[#DDE4D6] text-xs outline-none resize-y leading-relaxed placeholder-[#DDE4D6]/20" placeholder={"1. ここをクリック\n2. パラメータを入力\n3. 実行ボタンを押す"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ═══ オーバーレイ群 ═══ */}

      {/* [1] コマンドパレット */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setShowCommandPalette(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#1F221C] border border-[#2B6A1A]/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2B6A1A]/20">
              <Search className="w-5 h-5 text-[#619224] shrink-0" />
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={e => setCommandQuery(e.target.value)}
                placeholder="ツールを検索..."
                className="flex-1 bg-transparent text-[#DDE4D6] text-sm outline-none placeholder-[#DDE4D6]/30"
                onKeyDown={e => {
                  if (e.key === 'Escape') setShowCommandPalette(false);
                  if (e.key === 'Enter' && commandResults.length > 0) {
                    handleSelectTool(commandResults[0].id);
                    setShowCommandPalette(false);
                  }
                }}
              />
              <kbd className="text-[9px] font-bold text-[#DDE4D6]/30 bg-[#151713] px-2 py-0.5 rounded border border-[#2B6A1A]/20">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {commandResults.map((tool, i) => (
                <button
                  key={tool.id}
                  onClick={() => { handleSelectTool(tool.id); setShowCommandPalette(false); }}
                  className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-colors ${
                    i === 0 ? 'bg-[#2B6A1A]/20' : 'hover:bg-[#2B6A1A]/10'
                  } border-b border-[#2B6A1A]/10 last:border-0`}
                >
                  {getStatusDot(tool.id)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#DDE4D6] truncate">{tool.name}</div>
                    <div className="text-[10px] text-[#DDE4D6]/40 font-bold uppercase tracking-wider">{tool.category}</div>
                  </div>
                  {i === 0 && <span className="text-[9px] text-[#619224] font-bold">Enter</span>}
                </button>
              ))}
              {commandResults.length === 0 && (
                <div className="px-5 py-8 text-center text-[#DDE4D6]/30 text-sm">見つかりませんでした</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* [3] 確認ダイアログ */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setConfirmDialog(prev => ({ ...prev, show: false }))}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#2A2E25] border border-[#2B6A1A]/40 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-[#DDE4D6]">{confirmDialog.title}</h3>
            </div>
            <p className="text-[#DDE4D6]/70 text-sm mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(prev => ({ ...prev, show: false }))} className="px-5 py-2.5 text-[#DDE4D6]/60 hover:text-[#DDE4D6] rounded-xl text-xs font-bold transition-all border border-[#2B6A1A]/20 hover:border-[#2B6A1A]/40 hover:bg-[#2B6A1A]/10">
                キャンセル
              </button>
              <button onClick={confirmDialog.onConfirm} className="px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [8] コンテキストメニュー */}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-[#2A2E25] border border-[#2B6A1A]/50 rounded-xl shadow-2xl overflow-hidden min-w-[180px] animate-fade-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {(() => {
            const tool = tools.find(t => t.id === contextMenu.toolId);
            if (!tool) return null;
            return (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-[#DDE4D6]/40 uppercase tracking-wider border-b border-[#2B6A1A]/15 truncate">
                  {tool.name}
                </div>
                <button onClick={() => { handleSelectTool(tool.id); handleStartEdit(); setContextMenu(prev => ({ ...prev, show: false })); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2.5 transition-colors">
                  <Edit3 className="w-3.5 h-3.5 text-[#619224]" /> 編集
                </button>
                <button onClick={() => { copyToolData(tool); setContextMenu(prev => ({ ...prev, show: false })); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2.5 transition-colors">
                  <Copy className="w-3.5 h-3.5 text-[#619224]" /> JSONをコピー
                </button>
                {tool.url && (tool.url.startsWith('http://') || tool.url.startsWith('https://')) && (
                  <button onClick={() => { window.open(tool.url, '_blank'); setContextMenu(prev => ({ ...prev, show: false })); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2.5 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-[#619224]" /> URLを開く
                  </button>
                )}
                {tool.githubRepo && (
                  <button onClick={() => { window.open(`https://github.com/${tool.githubRepo}`, '_blank'); setContextMenu(prev => ({ ...prev, show: false })); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/20 flex items-center gap-2.5 transition-colors">
                    <GithubIcon className="w-3.5 h-3.5 text-[#619224]" /> GitHubを開く
                  </button>
                )}
                <div className="border-t border-[#2B6A1A]/15">
                  <button onClick={() => {
                    setContextMenu(prev => ({ ...prev, show: false }));
                    setConfirmDialog({
                      show: true,
                      title: 'ツールの削除',
                      message: `「${tool.name}」を削除しますか？この操作は取り消せません。`,
                      onConfirm: () => {
                        const newTools = tools.filter(t => t.id !== tool.id);
                        setTools(newTools);
                        if (selectedToolId === tool.id) setSelectedToolId(newTools.length > 0 ? newTools[0].id : null);
                        setMode('view');
                        setConfirmDialog(prev => ({ ...prev, show: false }));
                        addToast(`${tool.name} を削除しました`, 'info');
                      }
                    });
                  }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> 削除
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* [1] トースト通知 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold animate-fade-in backdrop-blur-sm ${
              toast.type === 'success' ? 'bg-[#2B6A1A]/90 border-[#619224]/50 text-[#DDE4D6]' :
              toast.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' :
              'bg-[#2A2E25]/95 border-[#2B6A1A]/40 text-[#DDE4D6]/90'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 text-green-300 shrink-0" />}
            {toast.type === 'error' && <X className="w-4 h-4 text-red-300 shrink-0" />}
            {toast.type === 'info' && <Trash2 className="w-3.5 h-3.5 text-[#DDE4D6]/60 shrink-0" />}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
