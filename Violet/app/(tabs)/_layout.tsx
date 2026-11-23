
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Platform,
} from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  // Atualiza o parâmetro da pesquisa enquanto o usuário digita.
  const pesquisarFilmes = (texto: string) => {
    router.setParams({ busca: texto });
  };

  return (
    <Tabs
      screenOptions={{
        header: () => (
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/imgs/Violet.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />

            <View style={styles.pesquisaContainer}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#b14cff"
              />

              <TextInput
                placeholder="Buscar filmes..."
                placeholderTextColor="#92879f"
                style={styles.pesquisaInput}
                returnKeyType="search"
                onChangeText={pesquisarFilmes}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        ),

        sceneStyle: {
          backgroundColor: '#0b0712',
        },

        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#b14cff',
        tabBarInactiveTintColor: '#92879f',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Filmes',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'film' : 'film-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ingressos"
        options={{
          title: 'Ingressos',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'ticket' : 'ticket-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pagamento"
        options={{
          title: 'Pagamento',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'card' : 'card-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0b0712',
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#281637',
  },

  headerLogo: {
    width: 105,
    height: 58,
  },

pesquisaContainer: {
  flex: 1,
  height: 46,
  backgroundColor: '#171020',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 15,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#49305f',
  gap: 10,

  shadowColor: '#b14cff',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 3,
},

pesquisaInput: {
  flex: 1,
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '500',
  marginLeft: 0,
  paddingVertical: 0,

  outlineWidth: 0,
  outlineColor: 'transparent',
  outlineStyle: 'solid',
},


  tabBar: {
    backgroundColor: '#100b18',
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: '#281637',
    elevation: 0,
    shadowOpacity: 0,
  },

  tabBarItem: {
    paddingVertical: 2,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
