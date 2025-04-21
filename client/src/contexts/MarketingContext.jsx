import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketingApi } from '../services/api';

// マーケティング管理コンテキスト
const MarketingContext = createContext();

// マーケティング管理プロバイダー
export const MarketingProvider = ({ children }) => {
  // 状態の初期化
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);
  const [analytics, setAnalytics] = useState({
    campaigns: {},
    coupons: {},
    segments: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // キャンペーン一覧取得
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用、本番環境ではAPI呼び出しに変更
      const response = await marketingApi.getMockCampaigns();
      setCampaigns(response.campaigns);
    } catch (err) {
      setError('キャンペーンの取得に失敗しました');
      console.error('キャンペーン取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // クーポン一覧取得
  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用
      const response = await marketingApi.getMockCoupons();
      setCoupons(response.coupons);
    } catch (err) {
      setError('クーポンの取得に失敗しました');
      console.error('クーポン取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 顧客一覧取得
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用
      const response = await marketingApi.getMockCustomers();
      setCustomers(response.customers);
    } catch (err) {
      setError('顧客情報の取得に失敗しました');
      console.error('顧客情報取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // ロイヤルティプログラム取得
  const fetchLoyaltyPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用
      const response = await marketingApi.getMockLoyaltyPrograms();
      setLoyaltyPrograms(response.programs);
      setLoyaltyTiers(response.tiers);
    } catch (err) {
      setError('ロイヤルティプログラムの取得に失敗しました');
      console.error('ロイヤルティプログラム取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン作成
  const createCampaign = async (campaignData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newCampaign = {
        ...campaignData,
        id: campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1,
        createdAt: new Date().toISOString()
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newCampaign = await marketingApi.createCampaign(campaignData);
      
      setCampaigns([...campaigns, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError('キャンペーンの作成に失敗しました');
      console.error('キャンペーン作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン更新
  const updateCampaign = async (id, campaignData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.id === id) {
          return { ...campaign, ...campaignData, updatedAt: new Date().toISOString() };
        }
        return campaign;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.updateCampaign(id, campaignData);
      
      setCampaigns(updatedCampaigns);
      return updatedCampaigns.find(campaign => campaign.id === id);
    } catch (err) {
      setError('キャンペーンの更新に失敗しました');
      console.error('キャンペーン更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン削除
  const deleteCampaign = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータから削除
      const filteredCampaigns = campaigns.filter(campaign => campaign.id !== id);
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.deleteCampaign(id);
      
      setCampaigns(filteredCampaigns);
    } catch (err) {
      setError('キャンペーンの削除に失敗しました');
      console.error('キャンペーン削除エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // クーポン作成
  const createCoupon = async (couponData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newCoupon = {
        ...couponData,
        id: coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1,
        usageCount: 0,
        createdAt: new Date().toISOString()
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newCoupon = await marketingApi.createCoupon(couponData);
      
      setCoupons([...coupons, newCoupon]);
      return newCoupon;
    } catch (err) {
      setError('クーポンの作成に失敗しました');
      console.error('クーポン作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // クーポン更新
  const updateCoupon = async (id, couponData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedCoupons = coupons.map(coupon => {
        if (coupon.id === id) {
          return { ...coupon, ...couponData, updatedAt: new Date().toISOString() };
        }
        return coupon;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.updateCoupon(id, couponData);
      
      setCoupons(updatedCoupons);
      return updatedCoupons.find(coupon => coupon.id === id);
    } catch (err) {
      setError('クーポンの更新に失敗しました');
      console.error('クーポン更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // クーポン削除
  const deleteCoupon = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータから削除
      const filteredCoupons = coupons.filter(coupon => coupon.id !== id);
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.deleteCoupon(id);
      
      setCoupons(filteredCoupons);
    } catch (err) {
      setError('クーポンの削除に失敗しました');
      console.error('クーポン削除エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // クーポン検証
  const validateCoupon = async (code) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用
      const coupon = coupons.find(c => c.code === code && c.status === 'active');
      
      if (!coupon) {
        throw new Error('無効なクーポンコードです');
      }
      
      return coupon;
    } catch (err) {
      setError('クーポンの検証に失敗しました');
      console.error('クーポン検証エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // クーポン利用
  const redeemCoupon = async (code, orderId) => {
    setLoading(true);
    setError(null);
    try {
      // クーポン検証
      const coupon = await validateCoupon(code);
      
      // 開発中はモックデータを更新
      const updatedCoupons = coupons.map(c => {
        if (c.id === coupon.id) {
          return {
            ...c,
            usageCount: c.usageCount + 1,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.redeemCoupon(code, orderId);
      
      setCoupons(updatedCoupons);
      return coupon;
    } catch (err) {
      setError('クーポンの利用に失敗しました');
      console.error('クーポン利用エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 顧客作成
  const createCustomer = async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newCustomer = {
        ...customerData,
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        totalVisits: 0,
        totalSpent: 0,
        registeredAt: new Date().toISOString()
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newCustomer = await marketingApi.createCustomer(customerData);
      
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError('顧客情報の作成に失敗しました');
      console.error('顧客情報作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 顧客更新
  const updateCustomer = async (id, customerData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedCustomers = customers.map(customer => {
        if (customer.id === id) {
          return { ...customer, ...customerData, updatedAt: new Date().toISOString() };
        }
        return customer;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.updateCustomer(id, customerData);
      
      setCustomers(updatedCustomers);
      return updatedCustomers.find(customer => customer.id === id);
    } catch (err) {
      setError('顧客情報の更新に失敗しました');
      console.error('顧客情報更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 顧客削除
  const deleteCustomer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータから削除
      const filteredCustomers = customers.filter(customer => customer.id !== id);
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.deleteCustomer(id);
      
      setCustomers(filteredCustomers);
    } catch (err) {
      setError('顧客情報の削除に失敗しました');
      console.error('顧客情報削除エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 顧客来店記録追加
  const addCustomerVisit = async (customerId, visitData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const customer = customers.find(c => c.id === customerId);
      
      if (!customer) {
        throw new Error('顧客が見つかりません');
      }
      
      const updatedCustomer = {
        ...customer,
        totalVisits: customer.totalVisits + 1,
        totalSpent: customer.totalSpent + (visitData.amount || 0),
        lastVisitDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // ロイヤルティポイント更新（支払金額の1%）
      const earnedPoints = Math.floor(visitData.amount / 100);
      updatedCustomer.loyaltyPoints += earnedPoints;
      
      // ティア更新
      const newTier = determineCustomerTier(updatedCustomer.loyaltyPoints);
      if (newTier !== updatedCustomer.loyaltyTier) {
        updatedCustomer.loyaltyTier = newTier;
      }
      
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      );
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.addCustomerVisit(customerId, visitData);
      // const updatedCustomer = await marketingApi.getCustomerById(customerId);
      
      setCustomers(updatedCustomers);
      return updatedCustomer;
    } catch (err) {
      setError('来店記録の追加に失敗しました');
      console.error('来店記録追加エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ポイント加算
  const addLoyaltyPoints = async (customerId, points, reason) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const customer = customers.find(c => c.id === customerId);
      
      if (!customer) {
        throw new Error('顧客が見つかりません');
      }
      
      const updatedCustomer = {
        ...customer,
        loyaltyPoints: customer.loyaltyPoints + points,
        updatedAt: new Date().toISOString()
      };
      
      // ティア更新
      const newTier = determineCustomerTier(updatedCustomer.loyaltyPoints);
      if (newTier !== updatedCustomer.loyaltyTier) {
        updatedCustomer.loyaltyTier = newTier;
      }
      
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      );
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.addLoyaltyPoints(customerId, points, reason);
      // const updatedCustomer = await marketingApi.getCustomerById(customerId);
      
      setCustomers(updatedCustomers);
      return updatedCustomer;
    } catch (err) {
      setError('ポイント加算に失敗しました');
      console.error('ポイント加算エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ポイント利用
  const redeemLoyaltyPoints = async (customerId, points, reward) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const customer = customers.find(c => c.id === customerId);
      
      if (!customer) {
        throw new Error('顧客が見つかりません');
      }
      
      if (customer.loyaltyPoints < points) {
        throw new Error('ポイントが不足しています');
      }
      
      const updatedCustomer = {
        ...customer,
        loyaltyPoints: customer.loyaltyPoints - points,
        updatedAt: new Date().toISOString()
      };
      
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      );
      
      // 実際のAPIが実装された場合は下記のように変更
      // await marketingApi.redeemLoyaltyPoints(customerId, points, reward);
      // const updatedCustomer = await marketingApi.getCustomerById(customerId);
      
      setCustomers(updatedCustomers);
      return updatedCustomer;
    } catch (err) {
      setError('ポイント利用に失敗しました');
      console.error('ポイント利用エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ロイヤルティプログラム作成
  const createLoyaltyProgram = async (programData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newProgram = {
        ...programData,
        id: loyaltyPrograms.length > 0 ? Math.max(...loyaltyPrograms.map(p => p.id)) + 1 : 1,
        createdAt: new Date().toISOString()
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newProgram = await marketingApi.createLoyaltyProgram(programData);
      
      setLoyaltyPrograms([...loyaltyPrograms, newProgram]);
      return newProgram;
    } catch (err) {
      setError('ロイヤルティプログラムの作成に失敗しました');
      console.error('ロイヤルティプログラム作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ロイヤルティティア判定
  const determineCustomerTier = (points) => {
    // ポイントに基づいてティアを判定
    const sortedTiers = [...loyaltyTiers].sort((a, b) => b.requiredPoints - a.requiredPoints);
    
    for (const tier of sortedTiers) {
      if (points >= tier.requiredPoints) {
        return tier.name;
      }
    }
    
    return 'bronze'; // デフォルトティア
  };

  // キャンペーン分析データ取得
  const getCampaignAnalytics = async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      // 実際のAPIが実装された場合は下記のように変更
      // const data = await marketingApi.getCampaignAnalytics(campaignId);
      
      // 開発中はモックデータを生成
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign) {
        throw new Error('キャンペーンが見つかりません');
      }
      
      // 関連クーポン取得
      const relatedCoupons = coupons.filter(c => c.campaignId === campaignId);
      
      // モック分析データ生成
      const analyticsData = {
        campaign: campaign,
        revenue: {
          actual: Math.floor(Math.random() * 1000000) + 100000,
          target: campaign.goals?.revenue || 0,
          percentage: 0
        },
        newCustomers: {
          actual: Math.floor(Math.random() * 100) + 10,
          target: campaign.goals?.newCustomers || 0,
          percentage: 0
        },
        coupons: {
          issued: relatedCoupons.reduce((sum, coupon) => sum + coupon.limit, 0),
          redeemed: relatedCoupons.reduce((sum, coupon) => sum + coupon.usageCount, 0),
          redemptionRate: 0
        }
      };
      
      // パーセンテージ計算
      analyticsData.revenue.percentage = analyticsData.revenue.target > 0 
        ? (analyticsData.revenue.actual / analyticsData.revenue.target) * 100 
        : 0;
        
      analyticsData.newCustomers.percentage = analyticsData.newCustomers.target > 0 
        ? (analyticsData.newCustomers.actual / analyticsData.newCustomers.target) * 100 
        : 0;
        
      analyticsData.coupons.redemptionRate = analyticsData.coupons.issued > 0 
        ? (analyticsData.coupons.redeemed / analyticsData.coupons.issued) * 100 
        : 0;
      
      // 分析データ保存
      setAnalytics({
        ...analytics,
        campaigns: {
          ...analytics.campaigns,
          [campaignId]: analyticsData
        }
      });
      
      return analyticsData;
    } catch (err) {
      setError('キャンペーン分析の取得に失敗しました');
      console.error('キャンペーン分析取得エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 顧客セグメント分析
  const getCustomerSegmentAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // 実際のAPIが実装された場合は下記のように変更
      // const data = await marketingApi.getCustomerSegmentAnalytics();
      
      // 開発中はモックデータを生成
      // 顧客セグメント別の集計
      const segments = {};
      const loyalCustomers = customers.filter(c => c.segment === 'loyal');
      const regularCustomers = customers.filter(c => c.segment === 'regular');
      const newCustomers = customers.filter(c => c.segment === 'new');
      
      segments.loyal = {
        count: loyalCustomers.length,
        avgVisits: loyalCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / (loyalCustomers.length || 1),
        avgSpent: loyalCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / (loyalCustomers.length || 1),
        loyaltyDistribution: {
          bronze: loyalCustomers.filter(c => c.loyaltyTier === 'bronze').length,
          silver: loyalCustomers.filter(c => c.loyaltyTier === 'silver').length,
          gold: loyalCustomers.filter(c => c.loyaltyTier === 'gold').length
        }
      };
      
      segments.regular = {
        count: regularCustomers.length,
        avgVisits: regularCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / (regularCustomers.length || 1),
        avgSpent: regularCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / (regularCustomers.length || 1),
        loyaltyDistribution: {
          bronze: regularCustomers.filter(c => c.loyaltyTier === 'bronze').length,
          silver: regularCustomers.filter(c => c.loyaltyTier === 'silver').length,
          gold: regularCustomers.filter(c => c.loyaltyTier === 'gold').length
        }
      };
      
      segments.new = {
        count: newCustomers.length,
        avgVisits: newCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / (newCustomers.length || 1),
        avgSpent: newCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / (newCustomers.length || 1),
        loyaltyDistribution: {
          bronze: newCustomers.filter(c => c.loyaltyTier === 'bronze').length,
          silver: newCustomers.filter(c => c.loyaltyTier === 'silver').length,
          gold: newCustomers.filter(c => c.loyaltyTier === 'gold').length
        }
      };
      
      // 分析データ保存
      setAnalytics({
        ...analytics,
        segments: segments
      });
      
      return segments;
    } catch (err) {
      setError('顧客セグメント分析の取得に失敗しました');
      console.error('顧客セグメント分析取得エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // データロード
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchCampaigns();
        await fetchCoupons();
        await fetchCustomers();
        await fetchLoyaltyPrograms();
      } catch (error) {
        console.error('マーケティングデータ読み込みエラー:', error);
        setError('マーケティングデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MarketingContext.Provider
      value={{
        campaigns,
        coupons,
        customers,
        loyaltyPrograms,
        loyaltyTiers,
        analytics,
        loading,
        error,
        fetchCampaigns,
        fetchCoupons,
        fetchCustomers,
        fetchLoyaltyPrograms,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        redeemCoupon,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        addCustomerVisit,
        addLoyaltyPoints,
        redeemLoyaltyPoints,
        createLoyaltyProgram,
        determineCustomerTier,
        getCampaignAnalytics,
        getCustomerSegmentAnalytics
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
};

// フックの作成
export const useMarketing = () => useContext(MarketingContext);
