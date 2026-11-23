
import { useEffect, useState } from 'react';
import { getFilmes } from '../services/api';
import {
  Pressable,
  Text,
  ScrollView,
  StyleSheet,
  View,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Produtos() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Recebe o texto digitado no cabeçalho.
  const { busca } = useLocalSearchParams<{ busca?: string }>();

  const termoBusca = (busca ?? '').trim().toLocaleLowerCase('pt-BR');
  const buscando = termoBusca.length > 0;

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFilmes().then((data) => {
      setMovies(data);
      setLoading(false);
    });
  }, []);

  // Define quantas colunas aparecem conforme a largura da tela.
  const colunas =
    width >= 1400 ? 6 :
      width >= 1050 ? 5 :
        width >= 800 ? 4 :
          width >= 550 ? 3 : 2;

  const espacamento = 16;
  const margem = width >= 800 ? 36 : 20;

  const larguraCard =
    (width - margem * 2 - espacamento * (colunas - 1)) / colunas;

  // Filtra os filmes pelo nome ou gênero.
  const filmesFiltrados = movies.filter((movie) => {
    const nome = (movie.nome ?? '').toLocaleLowerCase('pt-BR');
    const genero = (movie.genero ?? '').toLocaleLowerCase('pt-BR');

    return nome.includes(termoBusca) || genero.includes(termoBusca);
  });

  const destaque = movies[0];

  function abrirFilme(id: string | number) {
    router.push({
      pathname: '/movies/[id]',
      params: { id: id.toString() },
    });
  }

  if (loading) {
    return (
      <View style={[styles.fundo, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#b14cff" />
        <Text style={{ color: '#92879f', marginTop: 12 }}>
          Carregando catálogo...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fundo}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* DESTAQUE PRINCIPAL */}
        {!buscando && destaque && (
          <View style={styles.hero}>
            <View style={styles.heroTexto}>
              <View style={styles.etiquetaDestaque}>
                <Ionicons name="sparkles" size={13} color="#d4a0ff" />
                <Text style={styles.etiquetaTexto}>
                  DESTAQUE DA SEMANA
                </Text>
              </View>

              <Text style={styles.heroTitulo} numberOfLines={2}>
                {destaque.nome}
              </Text>

              <Text style={styles.heroDescricao} numberOfLines={4}>
                {destaque.sinopse || 'Sinopse não cadastrada.'}
              </Text>

              <Pressable
                style={styles.botaoExplorar}
                onPress={() => abrirFilme(destaque.id)}
              >
                <Ionicons name="ticket-outline" size={18} color="#ffffff" />
                <Text style={styles.botaoTexto}>Explorar filme</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.heroPoster}
              onPress={() => abrirFilme(destaque.id)}
            >
              <Image
                source={{ uri: destaque.imagem }}
                style={styles.heroImagem}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        )}

        {/* CABEÇALHO DO CATÁLOGO */}
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.subtituloSecao}>
            {buscando ? 'RESULTADOS DA PESQUISA' : 'ESCOLHA SEU PRÓXIMO FILME'}
          </Text>

          <Text style={styles.tituloSecao}>
            {buscando ? 'Filmes encontrados' : 'Em cartaz'}
          </Text>

          <View style={styles.linhaDecorativa} />
        </View>

        {/* GRADE DE FILMES */}
        {filmesFiltrados.length > 0 ? (
          <View style={styles.gradeFilmes}>
            {filmesFiltrados.map((movie) => (
              <View
                key={movie.id}
                style={[styles.card, { width: larguraCard }]}
              >
                <View style={styles.posterContainer}>
                  <Pressable
                    style={styles.posterClicavel}
                    onPress={() => abrirFilme(movie.id)}
                  >
                    <Image
                      source={{ uri: movie.imagem }}
                      style={styles.imagem}
                      resizeMode="cover"
                    />
                  </Pressable>

                  <Pressable
                    style={styles.botaoMais}
                    onPress={() => abrirFilme(movie.id)}
                    accessibilityLabel={`Ver detalhes de ${movie.nome}`}
                  >
                    <Ionicons name="add" size={23} color="#ffffff" />
                  </Pressable>
                </View>

                <View style={styles.informacoes}>
                  <Pressable onPress={() => abrirFilme(movie.id)}>
                    <Text style={styles.tituloFilme} numberOfLines={2}>
                      {movie.nome}
                    </Text>
                  </Pressable>

                  <Text style={styles.descricaoFilme} numberOfLines={2}>
                    {movie.genero}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.semResultados}>
            <Ionicons name="film-outline" size={42} color="#71647e" />

            <Text style={styles.semResultadosTitulo}>
              Nenhum filme encontrado
            </Text>

            <Text style={styles.semResultadosTexto}>
              Tente pesquisar por outro nome ou gênero.
            </Text>
          </View>
        )}

        {/* RODAPÉ */}
        <View style={styles.rodape}>
          <View style={styles.rodapeLinha} />
          <Text style={styles.rodapeTexto}>
            VIOLET+  •  SEU PRÓXIMO FILME ESTÁ AQUI
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#0b0712' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 35 },

  hero: {
    backgroundColor: '#171020',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#352044',
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 36,
    overflow: 'hidden',
  },
  heroTexto: { flex: 1, justifyContent: 'center' },
  etiquetaDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  etiquetaTexto: {
    color: '#d4a0ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitulo: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 12,
  },
  heroDescricao: {
    color: '#bcb2c9',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 20,
  },
  botaoExplorar: {
    backgroundColor: '#9b3df5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botaoTexto: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  heroPoster: {
    width: '36%',
    maxWidth: 190,
    minWidth: 95,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#24152f',
  },
  heroImagem: { width: '100%', height: '100%' },

  cabecalhoSecao: { marginBottom: 22 },
  subtituloSecao: {
    color: '#b14cff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  tituloSecao: { color: '#ffffff', fontSize: 27, fontWeight: '800' },
  linhaDecorativa: {
    width: 42,
    height: 3,
    backgroundColor: '#b14cff',
    borderRadius: 3,
    marginTop: 12,
  },

  gradeFilmes: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 16,
    rowGap: 26,
  },

  card: { backgroundColor: 'transparent' },
  posterContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#171020',
    borderWidth: 1,
    borderColor: '#352044',
    position: 'relative',
  },
  posterClicavel: { width: '100%', height: '100%' },
  imagem: { width: '100%', height: '100%' },
  botaoMais: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#9b3df5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c78aff',
  },
  informacoes: { paddingTop: 11, paddingHorizontal: 2 },
  tituloFilme: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 5,
  },
  descricaoFilme: { color: '#92879f', fontSize: 11, lineHeight: 16 },

  semResultados: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    paddingHorizontal: 20,
  },
  semResultadosTitulo: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 7,
  },
  semResultadosTexto: {
    color: '#92879f',
    fontSize: 13,
    textAlign: 'center',
  },

  rodape: { alignItems: 'center', marginTop: 40, gap: 15 },
  rodapeLinha: { height: 1, width: '100%', backgroundColor: '#281637' },
  rodapeTexto: {
    color: '#71647e',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
