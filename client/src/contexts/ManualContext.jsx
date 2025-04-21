import React, { createContext, useContext, useState, useEffect } from 'react';

// マニュアル管理コンテキスト
const ManualContext = createContext();

// マニュアル管理プロバイダー
export const ManualProvider = ({ children }) => {
  // マニュアル関連の状態
  const [manuals, setManuals] = useState([]);
  const [trainingMaterials, setTrainingMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初期データの読み込み
  useEffect(() => {
    fetchManualData();
    initMediaTypes();
  }, []);

  // メディアタイプの初期化
  const initMediaTypes = () => {
    const types = [
      { id: 'video', name: '動画', icon: 'movie' },
      { id: 'slide', name: 'スライド', icon: 'slideshow' },
      { id: 'image', name: '画像', icon: 'image' },
      { id: 'document', name: '文書', icon: 'description' }
    ];
    setMediaTypes(types);
  };

  // マニュアルデータの取得（モック）
  const fetchManualData = async () => {
    setLoading(true);
    try {
      // ここでAPIから実際のデータを取得する代わりにモックデータを使用
      const mockCategories = [
        { id: 'opening', name: '開店手順' },
        { id: 'closing', name: '閉店手順' },
        { id: 'complaint', name: 'クレーム対応' },
        { id: 'hygiene', name: '衛生管理' },
        { id: 'safety', name: '安全管理' },
        { id: 'service', name: 'サービス' },
        { id: 'training', name: 'トレーニング' }
      ];

      const mockTags = [
        { id: 'kitchen', name: 'キッチン' },
        { id: 'hall', name: 'ホール' },
        { id: 'manager', name: '管理者' },
        { id: 'newstaff', name: '新人スタッフ' },
        { id: 'emergency', name: '緊急時' },
        { id: 'daily', name: '日常業務' }
      ];

      const mockManuals = [
        {
          id: '1',
          title: '開店準備チェックリスト',
          description: 'レストラン開店前に行うべき準備手順と確認事項',
          content: `# 開店準備チェックリスト

## 1. 基本事項
- 店舗に到着したら、まず制服に着替える
- エプロンは清潔なものを使用する
- 髪の毛は帽子やヘアネットで完全に覆う
- 手洗いを徹底する（30秒以上）

## 2. キッチン準備
- 冷蔵庫の温度チェック（4℃以下）
- 冷凍庫の温度チェック（-18℃以下）
- 各調理器具の動作確認
- 食材の新鮮さ確認
- プレップ作業開始（野菜のカット、ソースの準備など）
- 調味料の補充

## 3. ホール準備
- テーブル・椅子の清掃
- テーブルセッティング（ナプキン、カトラリー）
- グラスの磨き上げ
- メニューの清掃と準備
- フロア掃除機がけ
- レジの準備と動作確認

## 4. トイレ・共用部
- トイレ清掃と消耗品補充
- 玄関周りの清掃
- 駐車場の確認

## 5. 最終確認
- BGMシステム起動
- 照明チェック
- 空調設定（季節に応じた適切な温度）
- スタッフミーティング（本日のスペシャルメニュー、予約状況の確認）

## 6. 開店
- 看板の点灯
- ドアのオープン
- お客様をお迎えする準備の完了確認`,
          category: 'opening',
          tags: ['daily', 'hall', 'kitchen'],
          createdAt: '2025-01-15T09:00:00',
          updatedAt: '2025-04-10T14:30:00',
          author: 'マネージャー佐藤',
          isRequired: true,
          version: '2.1'
        },
        {
          id: '2',
          title: '閉店手順マニュアル',
          description: '営業終了後に行うべき作業と翌日の準備',
          content: `# 閉店手順マニュアル

## 1. お客様の退店確認
- すべてのお客様が退店したことを確認
- 忘れ物がないか最終チェック

## 2. キッチンクローズ作業
- 調理器具の洗浄・消毒・片付け
- 食材の適切な保存（ラベル付け、日付記入）
- 冷蔵庫内の整理整頓
- 床の清掃（油汚れ等の徹底洗浄）
- ゴミの分別と廃棄

## 3. ホールクローズ作業
- テーブル・椅子の清掃
- フロア清掃
- 備品の補充（ナプキン、爪楊枝など）
- レジ締め作業と売上金の確認
- クレジットカード精算機の処理

## 4. 在庫確認
- 発注が必要な食材・消耗品のリスト作成
- 翌日の仕込み計画の確認

## 5. 設備確認
- ガスの元栓確認
- 電気機器の電源オフ確認
- 空調システムの設定変更
- 照明の消灯

## 6. 防犯・防災確認
- 窓・非常口の施錠
- 防犯カメラの作動確認
- 防火設備の確認

## 7. 翌日の準備
- 翌日の予約確認と準備
- 特別イベントがある場合の確認
- スタッフシフトの最終確認

## 8. 最終確認
- マネージャーによる店内の最終巡回
- アラームシステムの起動
- 出入り口の施錠`,
          category: 'closing',
          tags: ['daily', 'hall', 'kitchen', 'manager'],
          createdAt: '2025-01-15T09:30:00',
          updatedAt: '2025-03-25T17:15:00',
          author: 'マネージャー佐藤',
          isRequired: true,
          version: '1.8',
          media: [
            {
              id: 'media-2',
              type: 'slide',
              title: '閉店手順スライド',
              url: 'https://docs.google.com/presentation/d/e/2PACX-1vQ5MgC96VRMdUU4cftgHtiIDCzleLHLdQIVMjhikBNCjOzokfJ1VGBRwrYUEJFB_g/embed?start=false&loop=false&delayms=3000',
              description: '閉店手順を説明するスライド'
            }
          ]
        },
        {
          id: '3',
          title: 'クレーム対応ガイドライン',
          description: 'お客様からのクレームに適切に対応するための手順と注意点',
          content: `# クレーム対応ガイドライン

## 基本姿勢
- お客様の話を最後まで聞く（遮らない）
- 真摯な態度で謝罪する
- 解決策を提案する
- フォローアップを忘れない

## 対応手順

### 1. 初期対応
- お客様のお話を最後まで聞く
- メモを取り、状況を正確に把握する
- その場でできる解決策を提案する
- 必要に応じてマネージャーに連絡

### 2. マネージャー対応
- 状況の再確認と謝罪
- 適切な対応策の提案
- 必要に応じて料金調整や商品提供などの対応
- お客様の連絡先確認（フォローアップのため）

### 3. 記録と報告
- クレーム内容と対応策を記録
- スタッフミーティングでの共有と改善策の検討
- 再発防止策の立案

### 4. フォローアップ
- 状況に応じてお客様への連絡
- 再来店時の特別な対応の準備

## 主なクレームとその対応例

### 料理に関するクレーム
1. 料理が冷たい
   - 謝罪し、新しい料理を提供
   - 待ち時間に応じてドリンクなどのサービス提供を検討

2. 料理に異物混入
   - 即座に謝罪し、新しい料理を提供
   - マネージャーに報告し、料金の免除を検討
   - 異物の確認と原因究明を行う

### サービスに関するクレーム
1. 長い待ち時間
   - 謝罪と状況説明
   - ドリンクやアペタイザーのサービス提供
   - 順番の優先度調整

2. スタッフの接客態度
   - 謝罪と状況確認
   - 担当スタッフの変更の提案
   - 必要に応じて割引やサービス提供

## 注意事項
- お客様の前でスタッフ同士の責任追及をしない
- クレームの内容を個人的に受け止めない
- 解決が難しい場合は必ず上長に相談
- クレームはサービス向上のチャンスと考える

## 重要電話番号
- 店長：XXX-XXXX-XXXX
- 副店長：XXX-XXXX-XXXX
- 本部：XXX-XXXX-XXXX`,
          category: 'complaint',
          tags: ['hall', 'manager', 'emergency'],
          createdAt: '2025-02-01T10:15:00',
          updatedAt: '2025-04-05T11:20:00',
          author: '顧客サービス部 田中',
          isRequired: true,
          version: '3.2',
          media: [
            {
              id: 'media-3',
              type: 'video',
              title: 'クレーム対応基本トレーニング',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: 'クレーム対応の基本手順を説明する研修動画'
            }
          ]
        }
      ];

      const mockTrainingMaterials = [
        {
          id: '1',
          title: '新人スタッフオリエンテーション',
          description: '新しく入ったスタッフのための基本トレーニング資料',
          media: [
            {
              id: 'media-4',
              type: 'slide',
              title: 'オリエンテーションスライド',
              url: 'https://docs.google.com/presentation/d/e/2PACX-1vQ5MgC96VRMdUU4cftgHtiIDCzleLHLdQIVMjhikBNCjOzokfJ1VGBRwrYUEJFB_g/embed?start=false&loop=false&delayms=3000',
              description: '新入社員向けオリエンテーションスライド'
            },
            {
              id: 'media-5',
              type: 'video',
              title: '店舗紹介動画',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: '当店の紹介とサービス内容の説明'
            }
          ],
          content: `# 新人スタッフオリエンテーション

## 1. 会社概要
- 創業の歴史と理念
- 店舗数と展開地域
- 企業ビジョンとミッション

## 2. 基本ルール
- 出勤・退勤の手順
- 制服と身だしなみの基準
- 休憩時間の取り方
- 遅刻・欠勤時の連絡方法

## 3. 安全衛生
- 手洗いの徹底方法
- 食品衛生の基本
- 事故防止のポイント
- 緊急時の対応手順

## 4. 顧客サービス
- お客様への挨拶と基本対応
- 注文の取り方のコツ
- クレーム対応の基本姿勢
- レストラン独自のサービス特徴

## 5. システム操作
- POSレジの使い方
- 予約管理システムの操作方法
- 発注システムの基本

## 6. キャリアパス
- 昇進の仕組み
- スキルアップのための研修制度
- 評価制度の説明

## 7. チームワーク
- 部署間の連携の重要性
- コミュニケーションの取り方
- 問題解決の基本アプローチ

## 8. トレーニングスケジュール
- 1週目：基礎知識習得
- 2週目：OJTによる実践
- 3週目：独り立ち準備
- 4週目：評価とフィードバック

## 9. サポート体制
- トレーナーの紹介
- 質問・相談窓口
- フィードバックの受け方

## 10. 次のステップ
- 部門別トレーニングの案内
- 自己啓発のための資料紹介
- 目標設定の方法`,
          category: 'training',
          tags: ['newstaff', 'hall', 'kitchen'],
          createdAt: '2025-01-10T09:00:00',
          updatedAt: '2025-04-01T14:30:00',
          author: '研修部 山田',
          isRequired: true,
          version: '2.5',
          format: 'pdf'
        },
        {
          id: '2',
          title: 'ホールスタッフ接客トレーニング',
          description: 'ホールスタッフのための高品質なサービス提供に関するトレーニング',
          media: [
            {
              id: 'media-6',
              type: 'image',
              title: 'テーブルセッティング図解',
              url: 'https://placehold.co/800x600/png?text=テーブルセッティング図解',
              description: '正式なテーブルセッティングの方法を示した図解'
            },
            {
              id: 'media-7',
              type: 'video',
              title: '接客デモンストレーション',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: '実際の接客シーンのデモンストレーション動画'
            }
          ],
          content: `# ホールスタッフ接客トレーニング

## 1. プロフェッショナルなサービスの基本

### 挨拶と第一印象
- お客様を迎える適切な挨拶の言葉
- アイコンタクトの重要性
- 笑顔と表情の重要性
- 適切な距離感の保ち方

### 声のトーンと話し方
- 明瞭で聞き取りやすい話し方
- 敬語の正しい使い方
- 状況に応じた声の大きさの調整
- 方言と標準語の使い分け

## 2. テーブルサービスの技術

### お客様の案内
- レストランマップの理解と最適なテーブル選択
- メニューの手渡し方
- 椅子の引き方
- 荷物の取り扱い方

### 注文の取り方
- メニューの詳細な知識
- 質問への適切な回答の仕方
- 推奨メニューの提案方法
- アレルギーや食事制限への対応

### 料理の提供
- 正しい料理の運び方
- テーブルへの料理の置き方
- 「右からサーブ、左から下げる」の原則
- 複数の料理を同時に提供する技術

### ワインと飲み物のサービス
- ワインの開け方と提供方法
- グラスの持ち方と注ぎ方
- ドリンクメニューの知識
- 適切なタイミングでの提供

## 3. 特別なシチュエーション対応

### VIP対応
- 予約情報の事前確認
- 特別なおもてなしのポイント
- 記念日やお祝い事への対応

### 子供連れのお客様
- 子供用のアイテム（椅子、メニュー、食器）の準備
- 子供への適切な接し方
- 安全面での配慮

### 外国人のお客様
- 基本的な外国語フレーズ
- 文化の違いへの配慮
- 非言語コミュニケーションの活用

### 団体客対応
- 効率的なオーダー取りの方法
- 一斉の料理提供のコツ
- テーブル間のバランス管理

## 4. 問題解決とクレーム対応

### 一般的な問題への対処法
- 料理の遅延への対応
- 間違った注文への対処
- 混雑時のお客様の不満対応

### クレーム対応の基本
- 積極的な傾聴の姿勢
- 適切な謝罪の仕方
- 迅速な解決策の提示
- フォローアップの重要性

## 5. チームワークとコミュニケーション

### キッチンとの連携
- オーダーの正確な伝達方法
- 特別リクエストの伝え方
- 緊急時の優先順位の付け方

### 同僚との協力
- セクションの分担と協力体制
- 忙しい時間帯の助け合い
- 情報共有の重要性

## 6. 実践トレーニング

### ロールプレイングシナリオ
- 通常の接客シナリオ
- 困難なお客様対応シナリオ
- 特別なイベント対応シナリオ

### 評価とフィードバック
- 自己評価の方法
- 建設的なフィードバックの受け方
- 継続的な改善のための目標設定`,
          category: 'training',
          tags: ['hall', 'service', 'newstaff'],
          createdAt: '2025-02-15T13:45:00',
          updatedAt: '2025-03-20T10:30:00',
          author: '研修部 山田',
          isRequired: true,
          version: '1.7',
          format: 'video'
        }
      ];

      setCategories(mockCategories);
      setTags(mockTags);
      setManuals(mockManuals);
      setTrainingMaterials(mockTrainingMaterials);
    } catch (err) {
      setError('マニュアルデータの取得中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // マニュアルの検索
  const searchManuals = (query, filters = {}) => {
    setLoading(true);
    try {
      const searchTerm = query.toLowerCase();
      
      // フィルター条件の取得
      const { categories: categoryFilter = [], tags: tagFilter = [], type } = filters;
      
      // マニュアルとトレーニング資料を結合して検索
      let allDocuments = [...manuals];
      if (!type || type === 'training') {
        allDocuments = [...allDocuments, ...trainingMaterials];
      }
      
      // 検索とフィルタリング
      const results = allDocuments.filter(doc => {
        // カテゴリフィルター
        if (categoryFilter.length > 0 && !categoryFilter.includes(doc.category)) {
          return false;
        }
        
        // タグフィルター
        if (tagFilter.length > 0 && !doc.tags.some(tag => tagFilter.includes(tag))) {
          return false;
        }
        
        // 検索クエリに一致するかチェック
        return (
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm)
        );
      });
      
      setSearchResults(results);
      return results;
    } catch (err) {
      setError('検索中にエラーが発生しました');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // マニュアルの取得（ID指定）
  const getManualById = (id) => {
    const manual = manuals.find(m => m.id === id);
    if (manual) return manual;
    
    const trainingMaterial = trainingMaterials.find(t => t.id === id);
    return trainingMaterial || null;
  };

  // 新しいマニュアルの作成
  const createManual = (manualData) => {
    const newManual = {
      id: `manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      ...manualData
    };
    
    setManuals(prev => [newManual, ...prev]);
    return newManual;
  };

  // トレーニング資料の作成
  const createTrainingMaterial = (materialData) => {
    const newMaterial = {
      id: `training-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      category: 'training',
      ...materialData
    };
    
    setTrainingMaterials(prev => [newMaterial, ...prev]);
    return newMaterial;
  };

  // マニュアルの更新
  const updateManual = (id, updatedData) => {
    // マニュアルの更新
    let updated = false;
    
    setManuals(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      
      updated = true;
      const updatedManuals = [...prev];
      updatedManuals[index] = {
        ...updatedManuals[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
        version: parseFloat(updatedManuals[index].version || '1.0') + 0.1
      };
      
      return updatedManuals;
    });
    
    // トレーニング資料の更新
    if (!updated) {
      setTrainingMaterials(prev => {
        const index = prev.findIndex(t => t.id === id);
        if (index === -1) return prev;
        
        const updatedMaterials = [...prev];
        updatedMaterials[index] = {
          ...updatedMaterials[index],
          ...updatedData,
          updatedAt: new Date().toISOString(),
          version: parseFloat(updatedMaterials[index].version || '1.0') + 0.1
        };
        
        return updatedMaterials;
      });
    }
  };

  // マニュアルの削除
  const deleteManual = (id) => {
    // マニュアルの削除
    let deleted = false;
    
    setManuals(prev => {
      const filtered = prev.filter(m => m.id !== id);
      deleted = filtered.length !== prev.length;
      return filtered;
    });
    
    // トレーニング資料の削除
    if (!deleted) {
      setTrainingMaterials(prev => {
        return prev.filter(t => t.id !== id);
      });
    }
  };

  // カテゴリの追加
  const addCategory = (name) => {
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    };
    
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  // タグの追加
  const addTag = (name) => {
    const newTag = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    };
    
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  // メディアの追加
  const addMedia = (documentId, mediaData) => {
    const newMedia = {
      id: `media-${Date.now()}`,
      ...mediaData
    };
    
    // マニュアルの更新
    let updated = false;
    
    setManuals(prev => {
      const index = prev.findIndex(m => m.id === documentId);
      if (index === -1) return prev;
      
      updated = true;
      const updatedManuals = [...prev];
      const media = updatedManuals[index].media || [];
      updatedManuals[index] = {
        ...updatedManuals[index],
        media: [...media, newMedia],
        updatedAt: new Date().toISOString()
      };
      
      return updatedManuals;
    });
    
    // トレーニング資料の更新
    if (!updated) {
      setTrainingMaterials(prev => {
        const index = prev.findIndex(t => t.id === documentId);
        if (index === -1) return prev;
        
        const updatedMaterials = [...prev];
        const media = updatedMaterials[index].media || [];
        updatedMaterials[index] = {
          ...updatedMaterials[index],
          media: [...media, newMedia],
          updatedAt: new Date().toISOString()
        };
        
        return updatedMaterials;
      });
    }
    
    return newMedia;
  };
  
  // メディアの削除
  const removeMedia = (documentId, mediaId) => {
    // マニュアルの更新
    let updated = false;
    
    setManuals(prev => {
      const index = prev.findIndex(m => m.id === documentId);
      if (index === -1) return prev;
      
      const media = prev[index].media || [];
      if (!media.some(m => m.id === mediaId)) return prev;
      
      updated = true;
      const updatedManuals = [...prev];
      updatedManuals[index] = {
        ...updatedManuals[index],
        media: media.filter(m => m.id !== mediaId),
        updatedAt: new Date().toISOString()
      };
      
      return updatedManuals;
    });
    
    // トレーニング資料の更新
    if (!updated) {
      setTrainingMaterials(prev => {
        const index = prev.findIndex(t => t.id === documentId);
        if (index === -1) return prev;
        
        const media = prev[index].media || [];
        if (!media.some(m => m.id === mediaId)) return prev;
        
        const updatedMaterials = [...prev];
        updatedMaterials[index] = {
          ...updatedMaterials[index],
          media: media.filter(m => m.id !== mediaId),
          updatedAt: new Date().toISOString()
        };
        
        return updatedMaterials;
      });
    }
  };

  // コンテキスト値
  const value = {
    manuals,
    trainingMaterials,
    categories,
    tags,
    mediaTypes,
    searchResults,
    loading,
    error,
    searchManuals,
    getManualById,
    createManual,
    createTrainingMaterial,
    updateManual,
    deleteManual,
    addCategory,
    addTag,
    addMedia,
    removeMedia
  };

  return (
    <ManualContext.Provider value={value}>
      {children}
    </ManualContext.Provider>
  );
};

// マニュアル管理コンテキストを使用するためのフック
export const useManual = () => {
  const context = useContext(ManualContext);
  if (!context) {
    throw new Error('useManual must be used within a ManualProvider');
  }
  return context;
};

export default ManualContext;
