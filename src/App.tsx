import { useState, useMemo, useEffect } from 'react';
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
  GitCommit
} from 'lucide-react';

// カスタム GitHub アイコン (lucide-react 1.18.0互換用SVG)
const GithubIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// インターフェース定義
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

// 初期実データ
const INITIAL_TOOLS: Tool[] = [
  {
    id: 't1',
    name: '測量座標管理アプリ (Antigravity)',
    description: '測量現場で活用できる多機能な座標管理・計算ツールです。Web技術で構築されており、スマートフォンやタブレット、PCなど様々なデバイスで動作します。',
    category: 'Web App',
    url: 'https://techno-scm.vercel.app',
    githubRepo: 'taka2560-commits/Antigravity',
    instructions: '【主要機能】\n' +
      '・座標管理: 登録座標の一覧表示、入力・編集、検索、IndexedDBによる保存、CSV出力\n' +
      '・地図機能: Leaflet.jsを用いた座標プロット、地図からの座標登録、住所検索\n' +
      '・座標計算:\n' +
      '  - ST計算: 2点間の水平・傾斜距離、方位角、高低差の算出\n' +
      '  - 座標変換: 緯度経度⇔平面直角座標（1系〜19系）、ヘルマート変換\n' +
      '  - 標高改定対応: 国土地理院パラメータファイル(.par)による双一次内挿補正\n' +
      '  - ジオイド高計算: 地理院Web API連携によるジオイド高一括取得と変換\n' +
      '  - 標高系変換: T.P., O.P., K.P., N.P.の相互換算\n' +
      '  - 幅杭計算: 基準線からの前進距離と左右幅から新点の連続計算・保存\n' +
      '  - 真北角計算: 指定地点の真北方向角と磁北との差を算出\n' +
      '  - 水準測量: レレベルブック形式入力による器械高・地盤高自動計算、PDF出力\n' +
      '・建設電卓: 勾配計算、三角関数、単曲線計算、累加カウンター\n' +
      '・計算履歴: ローカル自動保存と入力値の復元機能\n\n' +
      '【セットアップと実行手順】\n' +
      '1. コマンドラインで `c:/Users/taka/Documents/Antigravity` に移動します。\n' +
      '2. `npm install` を実行して依存パッケージをインストールします。\n' +
      '3. `npm run dev` を実行してローカル開発サーバーを起動します。\n' +
      '4. ブラウザで `http://localhost:5173` を開いて使用します。\n\n' +
      '【基本的な使い方】\n' +
      '1. 「座標一覧」タブで「新規追加」をクリック、または地図上をクリックして座標を登録します。\n' +
      '2. 「計算」タブで実行したい機能を選択し、登録済みの点を選択、または手動入力して計算を実行します。\n' +
      '3. 計算結果は自動保存され、画面上部の履歴アイコンからいつでも復元できます。\n' +
      '4. データ引き継ぎ時は「CSV出力」を活用してエクスポートします。',
    history: [
      { id: 'h1', date: '2026-06-10', version: 'v2.1.0', changes: '幅杭計算（オフセット計算）機能の追加' }
    ]
  },
  {
    id: 't2',
    name: 'webCADアプリ (Antigravity webCAD)',
    description: 'スマートデバイスやPCの両方で利用できるWebブラウザベースの2D CADアプリケーションです。測量図面や建設現場での利用に特化した設計となっています。',
    category: 'Web App',
    url: 'https://antigravity-web-cad.vercel.app',
    githubRepo: 'taka2560-commits/webCAD',
    instructions: '【主要機能】\n' +
      '・DWG & DXF の高精度読み込み: WebAssembly (libredwg-web) によるブラウザ内パースと描画\n' +
      '・測量座標系対応: 縦方向をX座標、横方向をY座標として扱う表示、UCS（ユーザー座標系）設定\n' +
      '・スマホ最適化: 正確なスナップを可能にする「拡大鏡（ルーペ）機能」、自動フォーカス解除\n' +
      '・PWA対応: ホーム画面に追加することで全画面のネイティブ風アプリとして動作\n\n' +
      '【基本操作方法】\n' +
      '・PC:\n' +
      '  - 画面移動 (パン): マウスホイール（中ボタン）をドラッグ\n' +
      '  - 拡大・縮小 (ズーム): ホイールをスクロール\n' +
      '  - 範囲選択: 左から右へドラッグで「窓選択」（内包図形のみ）、右から左で「交差選択」（接触図形すべて）\n' +
      '・スマートフォン / タブレット:\n' +
      '  - 画面移動 (パン): 2本指でスライド\n' +
      '  - 拡大・縮小 (ズーム): 2本指でピンチイン・アウト\n' +
      '  - ルーペ機能: 1本指で画面を長押しスライドすると指の上に拡大ルーペが出現、指を離して決定\n\n' +
      '【主要コマンド】\n' +
      '画面下のコマンドライン、またはツールバーからエイリアス入力等で起動します。\n' +
      '  - LINE (L): 線分描画\n' +
      '  - CIRCLE (C): 円描画\n' +
      '  - PLINE (PL): ポリライン描画（完了で確定）\n' +
      '  - ERASE (E): 図形削除\n' +
      '  - MOVE (M) / COPY (CO): 移動と複写\n' +
      '  - ROTATE (RO): 回転\n' +
      '  - UCS / WCS: ユーザー座標系設定とワールド座標系復帰\n' +
      '  - ZOOM (ZE): 図面全体の表示調整\n\n' +
      '【セットアップと実行手順】\n' +
      '1. コマンドラインで `c:/Users/taka/Documents/Antigravity webCAD` に移動します。\n' +
      '2. `npm install` を実行し、`npm run dev` で起動します。',
    history: [
      { id: 'h2', date: '2026-03-21', version: 'v1.1.0', changes: 'WebAssembly (libredwg-web) によるAutoCAD DWGファイルの正式読み込み対応' }
    ]
  },
  {
    id: 't3',
    name: '杭管理ツール (Antigravity 杭管理ツール)',
    description: '杭の実測完了データを管理し、棟ごとの進捗状況や毎月20日締めの月次レポートを可視化・出力するためのWebアプリケーションです。',
    category: 'Web App',
    url: 'https://kui-kanri.vercel.app',
    githubRepo: 'taka2560-commits/KUI_kanri',
    instructions: '【主要機能】\n' +
      '・進捗可視化: 現場全体の合計完了・残数表示、棟別の進捗率棒グラフ（Recharts）表示\n' +
      '・棟の管理: 現場内の対象棟とそれぞれの「総杭数」を登録・編集\n' +
      '・実測データの連続登録: 指定した「棟」と「計測日」を固定保持し、杭名を素早く連続入力可能\n' +
      '・月次レポート: 「前月21日〜当月20日」締め区切りの完了杭リスト自動集計、CSVエクスポート\n' +
      '・SQLiteデータベース: データはローカルの `data/piles.db` 単一ファイルに保存\n\n' +
      '【操作手順】\n' +
      '1. 棟の登録: 設定画面で、あらかじめ対象となる棟の名前と総杭数を登録します。\n' +
      '2. 連続計測入力: 実測完了した杭の名称（例: No.1）を計測日と棟を指定した上で連続して入力・登録します。\n' +
      '3. レポートの確認: 毎月20日締めに基づいた対象月別の集計表を確認し、「CSV出力」ボタンから一括ダウンロードします。\n\n' +
      '【データの引継ぎ・バックアップ手順】\n' +
      '- 本システムは単一のSQLiteファイルを採用しているため、引継ぎはファイル共有のみで完了します。\n' +
      '1. 現管理者は、プロジェクト内の `data/piles.db` ファイルをコピーして新管理者に渡します。\n' +
      '2. 新管理者は、ローカルのプロジェクト内に `data` フォルダを作成し、その中に `piles.db` を配置します。\n' +
      '3. `npm run dev` で起動すると、以前の全データが引き継がれた状態でダッシュボードが復元されます。',
    history: [
      { id: 'h3', date: '2026-05-20', version: 'v1.0.0', changes: '杭データ連続登録機能、毎月20日締めレポート機能、およびSQLiteデータ保存の実装' }
    ]
  },
  {
    id: 't4',
    name: 'SiteSorter (SiteSorter)',
    description: '現場フォルダの自動整理および一元管理を行うPython製のデスクトップアプリケーションです。',
    category: 'Utility',
    url: 'c:/Users/taka/Documents/GitHub/SiteSorter',
    githubRepo: 'taka2560-commits/SiteSorter',
    instructions: '【主要機能】\n' +
      '・ドラッグ＆ドロップ仕分け: デスクトップ最前面のドロップゾーンへファイルをドロップして即時仕分け、またはメイン画面の専用枠へ投入してInboxへ一時仮置き\n' +
      '・仕分けルール自動化: キーワード辞書・拡張子ルールに基づき自動振分。AutoCADロックファイル（.dwl）などの一時ファイルは自動除外\n' +
      '・写真自動撮影日整理: 写真ファイル (.jpg/.jpeg) はメタデータから撮影日 (YYYY-MM-DD) を判別し自動でサブフォルダを構築\n' +
      '・図面PDF自動整理: ファイル名に「図面」「図」を含むPDFは「13_図面_PDF」へ優先振り分け\n' +
      '・仕分けの取り消し (Undo): 操作単位で直近5バッチ（最大50件）まで一括で元の場所に戻すことが可能\n' +
      '・複数現場の切り替え: 最大10件の現場作業フォルダ履歴から選択・切り替え\n\n' +
      '【基本的な使い方】\n' +
      '1. フォルダの準備: アプリの「参照...」ボタンから現場の作業フォルダを指定します。フォルダ内に「00_Inbox」や「90_その他」が自動生成されます。\n' +
      '2. ファイルの投入: 仕分けたいファイルをデスクトップ上の最前面ドロップゾーンにドラッグ＆ドロップします。\n' +
      '3. 仕分けの実行: 「仕分け実行」ボタンを押すと、ルール（rules.json）に基づいて自動で各フォルダへ振り分けられます。\n' +
      '4. ルールの編集: GUIの「ルール編集」から仕分け対象フォルダや対応する拡張子を自由に変更可能です。rules.json は `%APPDATA%/SiteSorter` に保存されます。\n\n' +
      '【セットアップと起動手順】\n' +
      '1. `site_sorter` フォルダを作業ディレクトリに配置します。\n' +
      '2. `setup.bat` をダブルクリックして仮想環境と必要ライブラリの構築、自動テストを実行します。\n' +
      '3. `起動.bat` をダブルクリックして、タスクトレイ常駐およびドロップゾーンを起動させます。',
    history: [
      { id: 'h4', date: '2026-06-12', version: 'v2.0.0', changes: 'フォルダ構成v2対応、PDF自動振り分けルール強化、直近50件のUndo対応、および設定・履歴保存先の%APPDATA%移行' }
    ]
  },
  {
    id: 't5',
    name: '作業日報自動入力システム (nippo-app)',
    description: '現場作業者向けの、シンプルで使いやすい作業日報入力アプリです。スマートフォンでの操作に最適化されており、PWAとして動作します。',
    category: 'Web App',
    url: 'https://nippo-app.vercel.app',
    githubRepo: 'taka2560-commits/nippo-app',
    instructions: '【主要機能】\n' +
      '・簡単入力: マスタ登録された選択肢から選ぶだけで、スムーズに日報を作成\n' +
      '・自動保存: 入力したデータはブラウザ内に自動的に保存（サーバー送信不要）\n' +
      '・オフライン対応: PWAとしてインストールすれば、電波の悪い場所でもアプリを開いて入力可能\n' +
      '・月報エクスポート: 毎月の締め日に合わせて、Excel（.xlsx）およびPDF形式で月報を出力\n' +
      '・柔軟なカスタマイズ: 作業者名、現場名、作業内容などのリストを自由に編集・管理可能\n\n' +
      '【基本的な使い方】\n' +
      '1. アプリのインストール: スマートフォンでアクセスし、ブラウザメニューから「ホーム画面に追加」を選択します。アイコンが追加され、全画面で動作します。\n' +
      '2. 日報の入力: 日付、参加した作業者、現場を選択し、作業内容、人工、時間を入力します。「＋作業を追加」ボタンで複数登録も可能です。\n' +
      '3. 日報の修正・削除: カレンダーで過去の日付を選択すると「再編集モード」になり、内容更新や削除が行えます。\n' +
      '4. 月報のエクスポート: 期間（前月16日〜当月15日）を指定し、対象年月の集計用データExcel、または印刷・提出用のPDFをダウンロードします。\n' +
      '5. 各種設定（マスタ管理）: 画面右上の⚙️アイコンから、作業者リスト、現場リスト、よく使う作業内容・材料などを管理・編集できます。\n\n' +
      '【注意事項】\n' +
      '- データはブラウザ内に保存されます。キャッシュクリアを行うと日報データが消える可能性があるため、必要なデータはこまめにExcel出力してバックアップすることをお勧めします。\n\n' +
      '【セットアップと実行手順】\n' +
      '1. コマンドラインで `c:/Users/taka/Documents/Antigravity 日報自動入力/nippo-app` に移動します。\n' +
      '2. `npm install` を実行し、`npm run dev` で起動します（localhost:3000でアクセス可能）。',
    history: [
      { id: 'h5', date: '2026-06-14', version: 'v1.0.0', changes: '初回リリース（Next.js移行、PWA対応、Excel・PDF出力の完了）' }
    ]
  },
  {
    id: 't6',
    name: 'T-Lmail (T-Lmail)',
    description: '仕事用メールの効率化に特化した、人間主導の「AIアシスタント型」メール管理クライアントです。Vercel上で動作し、AIが受信メールの抽出・仕分け提案、および返信メールのリライトを支援します。',
    category: 'Web App',
    url: 'https://t-lmail.vercel.app',
    githubRepo: 'taka2560-commits/t-lmail',
    instructions: '【主要機能】\n' +
      '・選択的な受信（フィルタリング）: 全てのメールを受信するのではなく、仕事に関連するキーワードや特定の送信元からのメールのみを抽出して表示します。\n' +
      '・AI提案・人間承認（自動仕分け）:\n' +
      '  - AIがメール内容を読み、「どのラベル（フォルダ）が適切か」を判定して提案します。\n' +
      '  - ユーザーが画面上で「OK」ボタンを押した時のみ、実際にGmail側でラベル付与やフォルダ移動を実行します。\n' +
      '・文章の添削（リライト）補助:\n' +
      '  - ユーザーが入力したラフな返信案を、AIがプロフェッショナルなビジネス表現や正しい文法に自動調整します。\n' +
      '  - AIは修正案を画面に提示するのみで、最終的な送信判断はユーザー自身が手動で行います。\n\n' +
      '【外部脳（業務ルール設定）】\n' +
      '・my_job_config.md によるカスタマイズ:\n' +
      '  - プロジェクト内の `my_job_config.md`（Markdownファイル）に直接ルールを書き込むことで、AIの動作を調整可能です。\n' +
      '  - 例：「〇〇社は『重要』」「金額があれば『見積』」といった仕分けルールを設定可能。\n' +
      '  - 例：「です・ます調」「簡潔に」などの添削・文章スタイルの好みを指定可能。\n\n' +
      '【開発・実行ロードマップ】\n' +
      '1. 基礎構築: 特定の条件に合うメールのみを抽出・表示する基盤を作成します。\n' +
      '2. 仕分け機能の実装: `my_job_config.md` を読み込み、ラベル案を提示・実行する確認ボタンを実装します。\n' +
      '3. 添削機能の実装: 返信入力欄と、設定ファイルに基づいたリライト実行ボタンを実装します。',
    history: [
      { id: 'h6', date: '2026-06-07', version: 'v0.1.0', changes: '開発計画案の作成、および「外部脳」定義ファイル（my_job_config.md）の設計完了' }
    ]
  }
];

// 操作マニュアルテキストの簡易装飾レンダラー
const renderInstructions = (text: string) => {
  if (!text) return <p className="text-[#DDE4D6]/50 text-xs font-medium">操作手順は登録されていません。</p>;

  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();

    // Markdown見出し: #, ##, ###, ####
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      
      // レベルに応じたフォントサイズ調整
      const sizeClass = level === 1 ? 'text-base font-black mt-6 mb-4 border-b border-[#2B6A1A]/20 pb-2.5' : 
                        level === 2 ? 'text-sm font-black mt-5 mb-3.5' : 'text-xs font-bold mt-4 mb-2.5';
      return (
        <h4 
          key={index} 
          className={`text-[#619224] tracking-wider flex items-center gap-2 border-l-2 border-[#619224] pl-2.5 ${sizeClass}`}
        >
          {title}
        </h4>
      );
    }

    // 【見出し】の判定 (従来互換)
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      return (
        <h4 
          key={index} 
          className="text-[#619224] font-black text-sm tracking-wider mt-5 mb-3.5 first:mt-0 flex items-center gap-2 border-l-2 border-[#619224] pl-2.5"
        >
          {trimmed.slice(1, -1)}
        </h4>
      );
    }
    
    // 箇条書き・手順（1. や - や * ）の判定
    if (line.match(/^(\s*)(\d+\.|-|\*)\s+/)) {
      return (
        <p 
          key={index} 
          className="text-[#DDE4D6]/90 text-[13px] leading-relaxed pl-5 -indent-5 mb-2.5 font-medium"
        >
          {line}
        </p>
      );
    }
    
    // 空行の判定（余白を適度に確保）
    if (trimmed === '') {
      return <div key={index} className="h-3" />;
    }

    // 一般行
    return (
      <p 
        key={index} 
        className="text-[#DDE4D6]/90 text-[13px] leading-relaxed mb-2 font-medium"
      >
        {line}
      </p>
    );
  });
};

export default function App() {
  // LocalStorageからツール情報を復元、なければ初期データを使用
  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('tool_manager_tools');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tools from localStorage', e);
      }
    }
    return INITIAL_TOOLS;
  });

  const [selectedToolId, setSelectedToolId] = useState<string | null>(() => {
    const saved = localStorage.getItem('tool_manager_tools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return INITIAL_TOOLS[0].id;
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // モード: 'view' | 'edit_tool' | 'add_tool'
  const [mode, setMode] = useState<string>('view');
  const [activeTab, setActiveTab] = useState<string>('instructions');

  // GitHub連携用のステート
  const [commitsCache, setCommitsCache] = useState<Record<string, HistoryItem[]>>({});
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  // README同期用のステート
  const [dynamicReadmes, setDynamicReadmes] = useState<Record<string, string>>({});
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);

  // ヘルスチェック用のステート
  const [toolStatuses, setToolStatuses] = useState<Record<string, 'active' | 'offline' | 'local' | 'checking'>>({});

  // 編集/追加用のステート
  const [formData, setFormData] = useState<Tool | null>(null);
  const [newHistory, setNewHistory] = useState<{ date: string; version: string; changes: string }>({ 
    date: new Date().toISOString().split('T')[0], 
    version: '', 
    changes: '' 
  });

  // tools の変更を LocalStorage に保存
  useEffect(() => {
    localStorage.setItem('tool_manager_tools', JSON.stringify(tools));
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tools, searchQuery]);

  const selectedTool = tools.find(t => t.id === selectedToolId);

  // ツールの選択処理
  const handleSelectTool = (id: string) => {
    setSelectedToolId(id);
    setMode('view');
    setActiveTab('instructions');
  };

  const handleStartAdd = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      category: 'Web App',
      url: '',
      githubRepo: '',
      instructions: '',
      history: []
    });
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
    if (!formData.name.trim()) return alert("ツール名を入力してください");

    if (mode === 'add_tool') {
      const newTool: Tool = {
        ...formData,
        id: `t${Date.now()}`,
        history: [{ id: `h${Date.now()}`, date: new Date().toISOString().split('T')[0], version: '1.0.0', changes: 'ツール登録' }]
      };
      setTools([newTool, ...tools]);
      setSelectedToolId(newTool.id);
    } else {
      setTools(tools.map(t => t.id === formData.id ? formData : t));
    }
    setMode('view');
  };

  const handleDeleteTool = () => {
    if (!selectedTool) return;
    if (window.confirm(`${selectedTool.name} を削除しますか？`)) {
      const newTools = tools.filter(t => t.id !== selectedToolId);
      setTools(newTools);
      if (newTools.length > 0) {
        setSelectedToolId(newTools[0].id);
      } else {
        setSelectedToolId(null);
      }
      setMode('view');
    }
  };

  const handleAddHistory = () => {
    if (!selectedTool || !newHistory.changes.trim()) return;
    const updatedTool: Tool = {
      ...selectedTool,
      history: [
        { id: `h${Date.now()}`, ...newHistory },
        ...(selectedTool.history || [])
      ]
    };
    setTools(tools.map(t => t.id === selectedTool.id ? updatedTool : t));
    setNewHistory({ date: new Date().toISOString().split('T')[0], version: '', changes: '' });
  };

  // GitHub APIからのコミット履歴データ取得
  useEffect(() => {
    if (activeTab === 'history' && selectedTool?.githubRepo) {
      const repo = selectedTool.githubRepo;
      
      // キャッシュがあればスキップ
      if (commitsCache[repo]) return; 

      const fetchCommits = async () => {
        setIsLoadingCommits(true);
        setCommitError(null);
        try {
          const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`);
          if (!response.ok) {
            throw new Error(response.status === 404 ? 'リポジトリが見つかりません' : 'コミット履歴の取得に失敗しました');
          }
          const data = await response.json();
          
          const formattedCommits: HistoryItem[] = data.map((c: any) => ({
            id: c.sha,
            type: 'github',
            date: c.commit.author.date.split('T')[0],
            timestamp: new Date(c.commit.author.date).getTime(),
            version: c.sha.substring(0, 7),
            changes: c.commit.message,
            url: c.html_url,
            author: c.commit.author.name
          }));

          setCommitsCache(prev => ({ ...prev, [repo]: formattedCommits }));
        } catch (err: any) {
          setCommitError(err.message);
        } finally {
          setIsLoadingCommits(false);
        }
      };

      fetchCommits();
    }
  }, [activeTab, selectedTool?.githubRepo, commitsCache]);

  // GitHub APIからの README 取得
  useEffect(() => {
    if (activeTab === 'instructions' && selectedTool?.githubRepo) {
      const repo = selectedTool.githubRepo;
      const toolId = selectedTool.id;

      if (dynamicReadmes[toolId]) return; // すでにキャッシュされていればスキップ

      const fetchReadme = async () => {
        setIsLoadingReadme(true);
        try {
          const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
          if (!response.ok) {
            throw new Error('READMEの同期に失敗しました');
          }
          const data = await response.json();
          // UTF-8対応のデコード処理
          const decoded = decodeURIComponent(
            escape(window.atob(data.content.replace(/\s/g, '')))
          );
          setDynamicReadmes(prev => ({ ...prev, [toolId]: decoded }));
        } catch (err: any) {
          console.error(err.message);
        } finally {
          setIsLoadingReadme(false);
        }
      };

      fetchReadme();
    }
  }, [activeTab, selectedToolId, selectedTool?.githubRepo, dynamicReadmes]);

  // 各ツールのヘルスチェック (Webツールのみ)
  useEffect(() => {
    const checkStatuses = async () => {
      const newStatuses = { ...toolStatuses };
      let changed = false;
      
      for (const tool of tools) {
        if (!tool.url) {
          if (newStatuses[tool.id] !== 'local') {
            newStatuses[tool.id] = 'local';
            changed = true;
          }
          continue;
        }

        const isWebUrl = tool.url.startsWith('http://') || tool.url.startsWith('https://');
        if (!isWebUrl) {
          if (newStatuses[tool.id] !== 'local') {
            newStatuses[tool.id] = 'local';
            changed = true;
          }
          continue;
        }

        // すでに確認済みならスキップ (リトライが必要な場合は将来的にリセット)
        if (newStatuses[tool.id] === 'active' || newStatuses[tool.id] === 'offline') {
          continue;
        }

        newStatuses[tool.id] = 'checking';
        setToolStatuses({ ...newStatuses });

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6秒タイムアウト

          // no-cors でフェッチして疎通テストを行う (CORSを回避)
          await fetch(tool.url, {
            method: 'GET',
            mode: 'no-cors',
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          newStatuses[tool.id] = 'active';
        } catch (e) {
          newStatuses[tool.id] = 'offline';
        }
        changed = true;
      }
      
      if (changed) {
        setToolStatuses({ ...newStatuses });
      }
    };

    checkStatuses();
  }, [tools]);

  // 手動履歴とGitHubコミットを統合して日付順にソート
  const combinedHistory = useMemo(() => {
    if (!selectedTool) return [];
    
    const manualHistory: HistoryItem[] = (selectedTool.history || []).map(h => ({ 
      ...h, 
      type: 'manual',
      timestamp: new Date(h.date).getTime() 
    }));
    
    const githubHistory = commitsCache[selectedTool?.githubRepo] || [];
    
    return [...manualHistory, ...githubHistory].sort((a, b) => {
      const tsA = a.timestamp || 0;
      const tsB = b.timestamp || 0;
      return tsB - tsA;
    });
  }, [selectedTool, commitsCache]);

  // --- UIコンポーネント ---

  // ステータスインジケーターの描画
  const getStatusIndicator = (id: string) => {
    const status = toolStatuses[id] || 'local';
    if (status === 'checking') {
      return <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shrink-0" title="接続確認中..." />;
    }
    if (status === 'active') {
      return <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] shrink-0" title="Web上で稼働中" />;
    }
    if (status === 'offline') {
      return <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] shrink-0" title="オフライン・応答なし" />;
    }
    // 'local'
    return <span className="w-2 h-2 rounded-full bg-[#DDE4D6]/20 shrink-0" title="ローカル環境専用" />;
  };

  const Sidebar = () => (
    <div className="w-80 bg-[#151713]/90 backdrop-blur-lg border-r border-[#2B6A1A]/20 flex flex-col h-screen transition-all">
      <div className="p-5 border-b border-[#2B6A1A]/20 bg-[#1F221C]/60">
        <h1 className="text-xl font-black text-[#DDE4D6] flex items-center gap-2.5 mb-4 tracking-tight">
          <FolderGit2 className="text-[#619224] w-6 h-6 -translate-y-[0.5px]" />
          ツールマネージャー
        </h1>
        <div className="relative group">
          <Search className="absolute left-3.5 top-3 text-[#DDE4D6]/35 w-4 h-4 transition-colors group-focus-within:text-[#619224] -translate-y-[0.5px]" />
          <input
            type="text"
            placeholder="ツールを検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#151713]/80 border border-[#2B6A1A]/40 rounded-xl text-sm text-[#DDE4D6] placeholder-[#DDE4D6]/30 focus:outline-none focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredTools.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleSelectTool(tool.id)}
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
              {getStatusIndicator(tool.id)}
              <div className="truncate flex-1">{tool.name}</div>
            </div>
            <div className={`text-[10px] mt-1 pl-4.5 font-extrabold tracking-wider uppercase ${selectedToolId === tool.id && mode !== 'add_tool' ? 'text-[#DDE4D6]/80' : 'text-[#DDE4D6]/40'}`}>
              {tool.category}
            </div>
          </button>
        ))}
        {filteredTools.length === 0 && (
          <div className="text-center text-[#DDE4D6]/40 text-sm mt-12 py-8 bg-[#1F221C]/25 rounded-2xl border border-[#2B6A1A]/10 border-dashed">
            見つかりませんでした
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#2B6A1A]/20 bg-[#1F221C]/60">
        <button
          onClick={handleStartAdd}
          className="w-full bg-[#803DF5]/10 hover:bg-[#803DF5]/20 text-[#803DF5] font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-[#803DF5]/25 hover:border-[#803DF5]/50 active:scale-[0.97] shadow-glow-accent shadow-glow-accent-hover"
        >
          <Plus className="w-5 h-5 -translate-y-[0.5px]" />
          新規ツール登録
        </button>
      </div>
    </div>
  );

  const ViewModeContent = () => {
    if (!selectedTool) return (
      <div className="flex-1 flex items-center justify-center text-[#DDE4D6]/40 bg-[#151713]/90 font-medium">
        ツールが選択されていません
      </div>
    );

    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1D201A] animate-fade-in">
        {/* ヘッダー */}
        <div className="px-8 py-8 border-b border-[#2B6A1A]/20 bg-gradient-to-b from-[#151713]/90 to-[#232720]/45 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-[#2B6A1A]/25 text-[#DDE4D6]/90 rounded-full text-[10px] font-black tracking-wider uppercase mb-3 border border-[#2B6A1A]/40 shadow-sm">
                {selectedTool.category}
              </span>
              <h2 className="text-3xl font-black text-[#DDE4D6] tracking-tight">{selectedTool.name}</h2>
            </div>
            <div className="flex gap-2.5">
              <button onClick={handleStartEdit} className="px-3.5 py-2 text-[#DDE4D6]/80 hover:bg-[#2B6A1A]/35 hover:text-[#DDE4D6] rounded-xl flex items-center gap-2 transition-all duration-300 border border-[#2B6A1A]/10 hover:border-[#2B6A1A]/40 active:scale-95 shadow-sm">
                <Edit3 className="w-4 h-4 -translate-y-[0.5px]" /> <span className="text-xs font-bold">編集</span>
              </button>
              <button onClick={handleDeleteTool} className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl flex items-center justify-center transition-all duration-300 border border-transparent hover:border-red-500/20 active:scale-95 shadow-sm">
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
          <p className="text-[#DDE4D6]/70 text-base leading-relaxed max-w-4xl font-medium">{selectedTool.description}</p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {selectedTool.url && (
              <div className="flex items-center gap-2 text-[#619224] bg-[#619224]/10 border border-[#619224]/20 px-3.5 py-2 rounded-xl max-w-full shadow-sm">
                <ExternalLink className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px]" />
                <span className="text-xs font-semibold truncate select-all">{selectedTool.url}</span>
              </div>
            )}
            {selectedTool.githubRepo && (
              <div className="flex items-center gap-2 text-[#DDE4D6]/80 bg-[#2B6A1A]/15 border border-[#2B6A1A]/30 px-3.5 py-2 rounded-xl max-w-full shadow-sm">
                <GithubIcon className="w-3.5 h-3.5 shrink-0 text-[#619224] -translate-y-[0.5px]" />
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
            <FileText className="w-4 h-4 -translate-y-[0.5px]" /> 概要・操作手順
            {activeTab === 'instructions' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#619224] rounded-t-full shadow-[0_-2px_8px_rgba(97,146,36,0.4)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 flex items-center gap-2 font-bold text-sm transition-all duration-300 relative active:scale-95 ${
              activeTab === 'history' ? 'text-[#619224]' : 'text-[#DDE4D6]/40 hover:text-[#DDE4D6]/70'
            }`}
          >
            <History className="w-4 h-4 -translate-y-[0.5px]" /> 更新履歴
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#619224] rounded-t-full shadow-[0_-2px_8px_rgba(97,146,36,0.4)]" />
            )}
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#151713] transition-all duration-300 flex flex-col items-start justify-start">
          {activeTab === 'instructions' ? (
            <div className="w-full max-w-5xl bg-[#2A2E25] p-8 rounded-2xl border border-[#2B6A1A]/25 shadow-md animate-fade-in">
              <h3 className="text-lg font-black mb-5 text-[#DDE4D6] flex justify-between items-center border-b border-[#2B6A1A]/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#619224] -translate-y-[0.5px]" />
                  操作マニュアル
                </div>
                {dynamicReadmes[selectedTool.id] && (
                  <span className="text-[9px] uppercase font-black tracking-wider bg-[#2B6A1A]/35 text-[#DDE4D6]/85 px-2 py-0.5 rounded-md border border-[#2B6A1A]/40 flex items-center gap-1.5 shadow-sm">
                    <GithubIcon className="w-3 h-3 text-[#619224] -translate-y-[0.5px]" /> GitHubから同期済み
                  </span>
                )}
              </h3>
              
              {isLoadingReadme ? (
                <div className="bg-[#151713]/80 p-12 rounded-xl border border-[#2B6A1A]/15 shadow-inner flex flex-col items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#619224] border-t-transparent rounded-full animate-spin mb-3.5"></div>
                  <span className="text-xs font-bold text-[#DDE4D6]/60">GitHubから最新マニュアルを読み込み中...</span>
                </div>
              ) : (
                <div className="bg-[#151713]/80 p-6 rounded-xl border border-[#2B6A1A]/15 shadow-inner">
                  {renderInstructions(dynamicReadmes[selectedTool.id] || selectedTool.instructions)}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-5xl animate-fade-in">
              {/* 履歴追加フォーム */}
              <div className="bg-[#2A2E25] p-6 rounded-2xl border border-[#2B6A1A]/20 shadow-md mb-8">
                <h4 className="text-sm font-black text-[#DDE4D6] mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#619224] -translate-y-[0.5px]" /> 新しい履歴を手動で記録
                </h4>
                <div className="flex flex-wrap md:flex-nowrap gap-3">
                  <input
                    type="date"
                    value={newHistory.date}
                    onChange={e => setNewHistory({...newHistory, date: e.target.value})}
                    className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 rounded-xl px-4 py-2.5 text-xs w-full md:w-44 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200 [color-scheme:dark]"
                  />
                  <input
                    type="text"
                    placeholder="Version (例: v1.1)"
                    value={newHistory.version}
                    onChange={e => setNewHistory({...newHistory, version: e.target.value})}
                    className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl px-4 py-2.5 text-xs w-full md:w-36 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="変更内容を入力..."
                    value={newHistory.changes}
                    onChange={e => setNewHistory({...newHistory, changes: e.target.value})}
                    className="bg-[#151713] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl px-4 py-2.5 text-xs flex-1 focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                  />
                  <button onClick={handleAddHistory} className="bg-[#619224] hover:bg-[#2B6A1A] text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 active:scale-95 shadow-md shadow-[#619224]/10 hover:shadow-glow-primary-hover w-full md:w-auto">
                    追加
                  </button>
                </div>
              </div>

              {/* 履歴タイムライン */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#2B6A1A]/30 before:via-[#2B6A1A]/30 before:to-transparent">
                
                {isLoadingCommits && (
                  <div className="text-center py-8 bg-[#2A2E25] rounded-2xl border border-[#2B6A1A]/20 shadow-md flex flex-col items-center justify-center mb-6 relative z-10 animate-fade-in">
                    <div className="w-6 h-6 border-2 border-[#619224] border-t-transparent rounded-full animate-spin mb-3.5"></div>
                    <span className="text-xs font-bold text-[#DDE4D6]/60">GitHubからコミット履歴を取得中...</span>
                  </div>
                )}
                
                {commitError && (
                  <div className="text-center py-4 px-6 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/15 rounded-xl mb-6 relative z-10 animate-fade-in">
                    ⚠️ {commitError}
                  </div>
                )}

                {combinedHistory.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                  >
                    {/* アイコン */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#151713] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110 ${
                      item.type === 'github' ? 'bg-[#2B6A1A] text-[#DDE4D6]' : 'bg-[#619224]/10 text-[#619224] border-2 border-[#619224]/30'
                    }`}>
                      {item.type === 'github' ? <GithubIcon className="w-4.5 h-4.5 -translate-y-[0.5px]" /> : <Clock className="w-4.5 h-4.5 -translate-y-[0.5px]" />}
                    </div>

                    {/* コンテンツカード */}
                    <div className={`w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-[#2A2E25] p-5 rounded-2xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] ${
                      item.type === 'github' 
                        ? 'border-[#2B6A1A]/20 hover:border-[#2B6A1A]/50' 
                        : 'border-[#619224]/20 hover:border-[#619224]/50 ring-1 ring-[#619224]/5 hover:ring-[#619224]/10'
                    }`}>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#DDE4D6] text-sm">{item.version || 'Update'}</span>
                          {item.type === 'github' && (
                            <span className="text-[9px] uppercase font-black tracking-wider bg-[#2B6A1A]/35 text-[#DDE4D6]/80 px-2 py-0.5 rounded-md border border-[#2B6A1A]/40 flex items-center gap-1">
                              <GitCommit className="w-2.5 h-2.5 text-[#619224] -translate-y-[0.5px]" /> Commit
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#DDE4D6]/50 bg-[#151713] border border-[#2B6A1A]/20 px-2.5 py-0.5 rounded-full">{item.date}</span>
                      </div>
                      
                      <p className="text-[#DDE4D6]/90 text-xs whitespace-pre-wrap leading-relaxed font-semibold">{item.changes}</p>
                      
                      {item.type === 'github' && (
                        <div className="mt-4 pt-3 border-t border-[#2B6A1A]/15 flex items-center justify-between text-[10px] font-bold text-[#DDE4D6]/40">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 bg-[#2B6A1A]/40 rounded-full flex items-center justify-center text-[7px] text-[#DDE4D6]">👤</span>
                            {item.author}
                          </span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#803DF5] hover:text-[#803DF5]/80 hover:underline flex items-center gap-1 transition-all duration-200">
                            GitHubで見る <ExternalLink className="w-2.5 h-2.5 -translate-y-[0.5px]" />
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
    );
  };

  const EditModeContent = () => {
    if (!formData) return null;

    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#151713] animate-fade-in">
        <div className="px-8 py-5 border-b border-[#2B6A1A]/20 bg-[#232720]/80 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-sm">
          <h2 className="text-2xl font-black text-[#DDE4D6] tracking-tight">
            {mode === 'add_tool' ? '✨ 新規ツールの登録' : '✏️ ツール情報の編集'}
          </h2>
          <div className="flex gap-2.5">
            <button 
              onClick={() => setMode('view')}
              className="px-5 py-2 text-[#DDE4D6]/60 hover:bg-[#2B6A1A]/15 hover:text-[#DDE4D6] rounded-xl text-xs font-bold transition-all duration-300"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSaveTool}
              className="px-6 py-2 bg-[#619224] hover:bg-[#2B6A1A] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all duration-300 active:scale-95 shadow-md shadow-[#619224]/10 hover:shadow-glow-primary-hover"
            >
              <Save className="w-4 h-4 -translate-y-[0.5px]" /> 保存する
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-[#2A2E25] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.25)] border border-[#2B6A1A]/20 p-8 space-y-6 animate-fade-in">
            
            <div>
              <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">ツール名 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                placeholder="例: 画像リサイズツール"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">カテゴリ</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                  placeholder="例: Web App, CLI, Script"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">URL / パス</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                  placeholder="例: https://..., C:/scripts/..."
                />
              </div>
            </div>

            <div className="bg-[#151713]/80 p-5 rounded-2xl border border-[#2B6A1A]/20">
              <label className="flex items-center gap-2 text-xs font-black text-[#DDE4D6]/80 mb-2.5 uppercase tracking-wider">
                <GithubIcon className="w-4.5 h-4.5 text-[#619224] -translate-y-[0.5px]" /> GitHubリポジトリ (任意)
              </label>
              <input
                type="text"
                value={formData.githubRepo || ''}
                onChange={e => setFormData({...formData, githubRepo: e.target.value})}
                className="w-full bg-[#1F221C] text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none transition-all duration-200"
                placeholder="例: facebook/react"
              />
              <p className="text-[10px] text-[#DDE4D6]/40 mt-2 font-bold leading-normal">
                <code className="bg-[#2B6A1A]/35 px-1.5 py-0.5 rounded text-[#DDE4D6]/70 font-semibold">owner/repo</code> 形式で入力すると、履歴タブを開いた際に最新のコミットログが自動的に表示されます。
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">概要・説明</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full bg-[#151713]/80 text-[#DDE4D6] border border-[#2B6A1A]/40 placeholder-[#DDE4D6]/20 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#619224]/30 focus:border-[#619224] outline-none resize-none transition-all duration-200"
                placeholder="ツールが何をするものか簡単な説明を記載"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#DDE4D6]/70 mb-2 uppercase tracking-wider">操作手順・マニュアル</label>
              <div className="border border-[#2B6A1A]/40 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#619224]/30 focus-within:border-[#619224] transition-all duration-200">
                <div className="bg-[#151713]/80 border-b border-[#2B6A1A]/40 p-3.5 text-[10px] font-bold text-[#DDE4D6]/50">
                  プレーンテキストで記述できます。箇条書きなどで分かりやすく記載してください。
                </div>
                <textarea
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  rows={8}
                  className="w-full p-4 bg-[#1F221C]/75 text-[#DDE4D6] text-xs outline-none resize-y leading-relaxed placeholder-[#DDE4D6]/20"
                  placeholder="1. ここをクリック&#10;2. パラメータを入力&#10;3. 実行ボタンを押す"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#1D201A] font-sans text-[#DDE4D6]">
      <Sidebar />
      {mode === 'view' ? <ViewModeContent /> : <EditModeContent />}
    </div>
  );
}
