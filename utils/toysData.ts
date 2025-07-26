export interface Toy {
  id: string;
  name: string;
  nameKo: string;
  series: string;
  seriesKo: string;
  description: string;
  imageUrl: string;
  popmartUrl: string;
}

export const toysData: Toy[] = [
  {
    id: 'crybaby-spring',
    name: 'CRYBABY',
    nameKo: '크라이베이비',
    series: 'Melancholy Rhythm Series',
    seriesKo: '멜랑콜리 리듬 시리즈',
    description: '플러시 봄 머쉰',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/crybaby.png',
    popmartUrl: 'https://www.popmart.com/kr/products/crybaby-spring-machine'
  },
  {
    id: 'labubu-monsters',
    name: 'LABUBU',
    nameKo: '라부부',
    series: 'The Monsters',
    seriesKo: '더 몬스터즈',
    description: '하이레이트 시리즈 사랑 커플',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/labubu.png',
    popmartUrl: 'https://www.popmart.com/kr/products/labubu-the-monsters'
  },
  {
    id: 'molly-castle',
    name: 'MOLLY',
    nameKo: '몰리',
    series: 'Castle Series',
    seriesKo: '캐슬 시리즈',
    description: '고전적이고 우아한 캐슬 컬렉션',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/molly.png',
    popmartUrl: 'https://www.popmart.com/kr/products/molly-castle-series'
  },
  {
    id: 'skullpanda-dark',
    name: 'SKULLPANDA',
    nameKo: '스컬판다',
    series: 'Dark Night Series',
    seriesKo: '다크 나이트 시리즈',
    description: '미스터리한 다크 판타지 컬렉션',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/skullpanda.png',
    popmartUrl: 'https://www.popmart.com/kr/products/skullpanda-dark-night'
  },
  {
    id: 'dimoo-world',
    name: 'DIMOO',
    nameKo: '디무',
    series: 'Dimoo World',
    seriesKo: '디무 월드',
    description: '귀여운 디무의 일상 이야기',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/dimoo.png',
    popmartUrl: 'https://www.popmart.com/kr/products/dimoo-world-series'
  },
  {
    id: 'pucky-pool',
    name: 'PUCKY',
    nameKo: '푸키',
    series: 'Pool Babies',
    seriesKo: '풀 베이비즈',
    description: '여름 수영장 테마 컬렉션',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/pucky.png',
    popmartUrl: 'https://www.popmart.com/kr/products/pucky-pool-babies'
  },
  {
    id: 'hirono-little',
    name: 'HIRONO',
    nameKo: '히로노',
    series: 'Little Mischief',
    seriesKo: '리틀 미스치프',
    description: '장난꾸러기 히로노의 모험',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/hirono.png',
    popmartUrl: 'https://www.popmart.com/kr/products/hirono-little-mischief'
  },
  {
    id: 'kubo-roar',
    name: 'KUBO',
    nameKo: '쿠보',
    series: 'Roar Series',
    seriesKo: '로어 시리즈',
    description: '용감한 쿠보의 포효',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/kubo.png',
    popmartUrl: 'https://www.popmart.com/kr/products/kubo-roar-series'
  },
  {
    id: 'bearbrick-400',
    name: 'BE@RBRICK',
    nameKo: '베어브릭',
    series: '400% Series',
    seriesKo: '400% 시리즈',
    description: '리미티드 에디션 400% 사이즈',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/bearbrick.png',
    popmartUrl: 'https://www.popmart.com/kr/products/bearbrick-400-limited'
  },
  {
    id: 'molang-sweet',
    name: 'MOLANG',
    nameKo: '몰랑이',
    series: 'Sweet Dream',
    seriesKo: '스위트 드림',
    description: '귀여운 토끼 캐릭터 한정판',
    imageUrl: 'https://api.hjun.kr/hackathon/static/images/molang.png',
    popmartUrl: 'https://www.popmart.com/kr/products/molang-sweet-dream'
  }
];

// 찜한 아이템 ID 목록 (예시)
export const favoriteToyIds = ['crybaby-spring', 'labubu-monsters', 'skullpanda-dark', 'pucky-pool'];

// 소유한 아이템 ID 목록 (예시)
export const ownedToyIds = ['molly-castle', 'dimoo-world', 'bearbrick-400', 'molang-sweet'];