import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Ensure @expo/vector-icons is installed

// Validate icon names: Check https://materialdesignicons.com/
// Valid names used here: 'bitcoin', 'ethereum', 'doge', 'binance', 'solana'
type CoinId = 'bitcoin' | 'ethereum' | 'doge' | 'binance' | 'solana'; // Corrected invalid IDs

interface Coin {
  id: CoinId; // Now matches valid icon names
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  priceChange24h: number;
}

const formatNumber = (num: number) => {
  const options = {
    minimumFractionDigits: num < 1 ? 4 : 2,
    maximumFractionDigits: num < 1 ? 4 : 2,
  };
  return num.toLocaleString('en-US', options);
};

export default function HomeScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [portfolioBalance, setPortfolioBalance] = useState<number>(0);
  const [portfolioChange24h, setPortfolioChange24h] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock data with valid CoinId icons (adjusted IDs)
  const mockCoins: Coin[] = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 42000,
      quantity: 0.3,
      priceChange24h: 1.2,
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2100,
      quantity: 2.5,
      priceChange24h: -0.8,
    },
    {
      id: 'doge', // Corrected from 'dogecoin' (matches MaterialCommunityIcons name)
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.08,
      quantity: 1000,
      priceChange24h: 3.5,
    },
    {
      id: 'binance', // Corrected from 'binancecoin' (matches MaterialCommunityIcons name)
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 300,
      quantity: 1.2,
      priceChange24h: 0.5,
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      price: 45,
      quantity: 5,
      priceChange24h: -2.1,
    },
  ];

  const fetchCryptoData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Calculate portfolio metrics
    const totalValue = mockCoins.reduce((sum, coin) => sum + (coin.price * coin.quantity), 0);
    const sumWeightedChange = mockCoins.reduce((sum, coin) => 
      sum + (coin.price * coin.quantity) * (coin.priceChange24h / 100), 0);
    const portfolioChange = totalValue === 0 ? 0 : (sumWeightedChange / totalValue) * 100;

    setCoins(mockCoins);
    setPortfolioBalance(totalValue);
    setPortfolioChange24h(portfolioChange);
    setLoading(false);
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Fetching crypto data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>🚀 Crypto Dashboard</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Portfolio Balance</Text>
          
          <LinearGradient
            colors={['#00ff00', '#00ffff', '#0000ff']}
            style={styles.balanceAmountContainer}
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.balanceAmount}>${formatNumber(portfolioBalance)}</Text>
          </LinearGradient>

          <View style={styles.balanceChangeRow}>
            <MaterialCommunityIcons 
              name={portfolioChange24h >= 0 ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={portfolioChange24h >= 0 ? '#00ff00' : '#ff0000'}
            />
            <Text style={[
              styles.balancePercentage, 
              portfolioChange24h >= 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              {portfolioChange24h.toFixed(2)}%
            </Text>
            <Text style={styles.balanceTime}>24h</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.subtitle}>Top Coins</Text>
          <TouchableOpacity onPress={() => console.log('See all pressed')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coinListContainer}>
          <FlatList
            data={coins}
            renderItem={({ item }: { item: Coin }) => (
              <TouchableOpacity 
                style={styles.coinItem} 
                activeOpacity={0.9}
                onPress={() => console.log(`Navigating to ${item.name} details`)}
              >
                <View style={styles.coinIconContainer}>
                  {/* Now 'item.id' matches valid MaterialCommunityIcons names */}
                  <MaterialCommunityIcons 
                    name={item.id} 
                    size={28} 
                    color="#fff" 
                    style={styles.coinIcon}
                  />
                  <Text style={styles.coinSymbol}>{item.symbol}</Text>
                </View>

                <View style={styles.coinInfo}>
                  <Text style={styles.coinName}>{item.name}</Text>
                  <Text style={styles.coinPrice}>${formatNumber(item.price)}</Text>
                </View>

                <View style={styles.coinChangeContainer}>
                  <Text style={[
                    styles.coinChangeText, 
                    item.priceChange24h >= 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {item.priceChange24h >= 0 ? `+${item.priceChange24h.toFixed(2)}%` : `${item.priceChange24h.toFixed(2)}%`}
                  </Text>
                  <MaterialCommunityIcons 
                    name={item.priceChange24h >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={18}
                    color={item.priceChange24h >= 0 ? '#00ff00' : '#ff0000'}
                  />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.coinListContent}
            showsVerticalScrollIndicator={false}
            extraData={coins}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  balanceCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmountContainer: {
    width: '100%',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  balanceChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  balancePercentage: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    color: '#00ffff',
    textDecorationLine: 'underline',
  },
  coinListContainer: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coinListContent: {
    paddingBottom: 20,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  coinIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  coinIcon: {
    marginRight: 8,
  },
  coinSymbol: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  coinPrice: {
    fontSize: 14,
    color: '#ddd',
  },
  coinChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinChangeText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  positiveChange: {
    color: '#00ff00',
  },
  negativeChange: {
    color: '#ff0000',
  },
});