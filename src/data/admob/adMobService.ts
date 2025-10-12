import { AdMob, BannerAdSize, BannerAdPosition, AdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

class AdmobService {
  private isInterstitialLoaded = false;
  private isRewardedLoaded = false;
  private platform: string = 'web';

  // Ad IDs configuration for different platforms
  private adIds = {
    android: {
      banner: 'ca-app-pub-5356290658102298/6388278240',
      interstitial: 'ca-app-pub-5356290658102298/1510861246',
      rewarded: 'ca-app-pub-5356290658102298/1623090621'
    },
    ios: {
      banner: 'ca-app-pub-5356290658102298/4305094281',
      interstitial: 'ca-app-pub-5356290658102298/3762114906',
      rewarded: 'ca-app-pub-5356290658102298/1135951563'
    }
  };

 private detectPlatform() {
  this.platform = Capacitor.getPlatform();
  console.log('Platform detected:', this.platform);
  if (this.platform === 'web') {
    console.warn('AdMob not supported on web platform');
  }
}




  private getAdId(adType: 'banner' | 'interstitial' | 'rewarded'): string {
    const platformKey = this.platform === 'ios' ? 'ios' : 'android';
    return this.adIds[platformKey][adType];
  }

  async initialize() {
    try {
      // Detect platform first
      this.detectPlatform();
      
      await AdMob.initialize({
        initializeForTesting: true, // Set to true for testing
      });
      console.log('AdMob initialized');
      // Prepare first interstitial after initialization
      await this.prepareInterstitial();
      await this.prepareRewarded();
    } catch (err) {
      console.error('AdMob init error:', err);
    }
  }

  async showBanner() {
    try {
      await AdMob.showBanner({
        adId: this.getAdId('banner'),
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 50,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        isTesting: true, // Set to true for testing
      });
      console.log('Banner shown');
    } catch (err) {
      console.error('Banner error:', err);
    }
  }
  
  async prepareInterstitial() {
    try {
      await AdMob.prepareInterstitial({
        adId: this.getAdId('interstitial'), 
        isTesting: true,
      } as AdOptions);
      this.isInterstitialLoaded = true;
      console.log('Interstitial prepared');
    } catch (err) {
      this.isInterstitialLoaded = false;
      console.error('Prepare interstitial error:', err);
    }
  }

  async hideBanner() {
    try {
      await AdMob.hideBanner();
      console.log('Banner hidden');
    } catch (err) {
      console.error('Hide banner error:', err);
    }
  }

async showInterstitial() {
  try {
    const shouldShow = Math.random() < 0.75; // 75% de chance
    if (!shouldShow) {
      console.log('Interstitial non affiché (fréquence limitée)');
      return;
    }
    if (!this.isInterstitialLoaded) {
      await this.prepareInterstitial();
    }
    await AdMob.showInterstitial();
    console.log('Interstitial shown');
    this.isInterstitialLoaded = false;
    await this.prepareInterstitial();
  } catch (err) {
    console.error('Interstitial error:', err);
    this.isInterstitialLoaded = false;
  }
}


   async prepareRewarded() {
    try {
      await AdMob.prepareRewardVideoAd({
        adId: this.getAdId('rewarded'),
        isTesting: true,
      } as AdOptions);
      this.isRewardedLoaded = true;
      console.log('Rewarded ad prepared');
    } catch (err) {
      this.isRewardedLoaded = false;
      console.error('Prepare rewarded error:', err);
    }
  }

  async showRewarded() {
    try {
      if (!this.isRewardedLoaded) {
        await this.prepareRewarded();
      }
      const rewardItem = await AdMob.showRewardVideoAd();
      console.log('Rewarded ad shown, reward:', rewardItem);
      this.isRewardedLoaded = false;
      await this.prepareRewarded();
      return rewardItem; // { type: string, amount: number }
    } catch (err) {
      console.error('Rewarded error:', err);
      this.isRewardedLoaded = false;
      return null;
    }
  }

  getIsRewardedLoaded() {
    return this.isRewardedLoaded;
  }
}

export const admobService = new AdmobService();
