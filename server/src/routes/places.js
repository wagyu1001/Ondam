import express from 'express';
const router = express.Router();

// 전라북도 주요 관광지 데이터
const touristAttractions = [
  // 전주시
  {
    id: 'jeonju_hanok_village',
    name: '전주한옥마을',
    category: '문화유산',
    region: '전주시',
    address: '전라북도 전주시 완산구 기린대로 99',
    coordinates: [35.8150, 127.1530],
    description: '전통 한옥이 밀집된 대표적인 관광지',
    rating: 4.3,
    image: '/images/jeonju_hanok.jpg'
  },
  {
    id: 'gyeonggijeon_shrine',
    name: '경기전',
    category: '문화유산',
    region: '전주시',
    address: '전라북도 전주시 완산구 태조로 44',
    coordinates: [35.8145, 127.1495],
    description: '조선 태조 이성계의 어진을 모신 곳',
    rating: 4.2,
    image: '/images/gyeonggijeon.jpg'
  },
  {
    id: 'jeonju_nambu_market',
    name: '전주남부시장',
    category: '전통시장',
    region: '전주시',
    address: '전라북도 전주시 완산구 풍남문3길 2-3',
    coordinates: [35.8120, 127.1480],
    description: '전주의 대표적인 전통시장',
    rating: 4.1,
    image: '/images/nambu_market.jpg'
  },
  
  // 군산시
  {
    id: 'gunsan_modern_history_museum',
    name: '군산근대역사박물관',
    category: '박물관',
    region: '군산시',
    address: '전라북도 군산시 해망로 240',
    coordinates: [35.9676, 126.7115],
    description: '군산의 근대 역사를 한눈에 볼 수 있는 박물관',
    rating: 4.4,
    image: '/images/gunsan_museum.jpg'
  },
  {
    id: 'gunsan_time_travel_village',
    name: '군산 시간여행마을',
    category: '테마마을',
    region: '군산시',
    address: '전라북도 군산시 구영1길 16',
    coordinates: [35.9665, 126.7105],
    description: '일제강점기 모습을 재현한 테마마을',
    rating: 4.2,
    image: '/images/time_travel.jpg'
  },
  
  // 익산시
  {
    id: 'mireuksa_temple',
    name: '미륵사지',
    category: '문화유산',
    region: '익산시',
    address: '전라북도 익산시 금마면 미륵사지로 362',
    coordinates: [36.0122, 127.0297],
    description: '백제 최대 규모의 사찰 유적지',
    rating: 4.3,
    image: '/images/mireuksa.jpg'
  },
  
  // 정읍시
  {
    id: 'naejangsan_national_park',
    name: '내장산국립공원',
    category: '자연경관',
    region: '정읍시',
    address: '전라북도 정읍시 내장동',
    coordinates: [35.4975, 126.8897],
    description: '단풍으로 유명한 국립공원',
    rating: 4.5,
    image: '/images/naejangsan.jpg'
  },
  
  // 고창군
  {
    id: 'gochang_dolmen_site',
    name: '고창 고인돌 유적',
    category: '문화유산',
    region: '고창군',
    address: '전라북도 고창군 고창읍 죽림리',
    coordinates: [35.4336, 126.7014],
    description: 'UNESCO 세계문화유산 고인돌 유적지',
    rating: 4.1,
    image: '/images/gochang_dolmen.jpg'
  },
  
  // 부안군
  {
    id: 'byeonsanbando_national_park',
    name: '변산반도국립공원',
    category: '자연경관',
    region: '부안군',
    address: '전라북도 부안군 변산면',
    coordinates: [35.6147, 126.4889],
    description: '서해안의 아름다운 해안선과 산악지형',
    rating: 4.4,
    image: '/images/byeonsanbando.jpg'
  }
];

// 권역별 음식점 데이터
const restaurants = [
  // 전주시 음식점
  {
    id: 'jeonju_bibimbap_house',
    name: '한국집',
    category: '한식',
    region: '전주시',
    address: '전라북도 전주시 완산구 경기전길 6',
    coordinates: [35.8140, 127.1520],
    description: '전주 비빔밥의 원조집',
    rating: 4.5,
    specialties: ['비빔밥', '돌솥비빔밥'],
    price_range: '10,000-15,000원',
    image: '/images/korean_house.jpg'
  },
  {
    id: 'jeonju_kongnamul_gukbap',
    name: '현대옥',
    category: '한식',
    region: '전주시',
    address: '전라북도 전주시 완산구 전라감영길 11-5',
    coordinates: [35.8135, 127.1485],
    description: '전주 콩나물국밥 맛집',
    rating: 4.3,
    specialties: ['콩나물국밥', '순대국밥'],
    price_range: '7,000-9,000원',
    image: '/images/hyundae_ok.jpg'
  },
  {
    id: 'jeonju_makgeolli',
    name: '삼천동 주막',
    category: '전통주점',
    region: '전주시',
    address: '전라북도 전주시 완산구 은행로 36',
    coordinates: [35.8125, 127.1475],
    description: '전통 막걸리와 안주를 즐길 수 있는 곳',
    rating: 4.2,
    specialties: ['생막걸리', '파전', '두부김치'],
    price_range: '15,000-25,000원',
    image: '/images/samcheon_jumak.jpg'
  },
  
  // 군산시 음식점
  {
    id: 'gunsan_jjajangmyeon',
    name: '빈해원',
    category: '중식',
    region: '군산시',
    address: '전라북도 군산시 중앙로1가 17-1',
    coordinates: [35.9670, 126.7120],
    description: '군산 짜장면의 원조집',
    rating: 4.4,
    specialties: ['짜장면', '짬뽕', '탕수육'],
    price_range: '6,000-12,000원',
    image: '/images/binhaewon.jpg'
  },
  {
    id: 'gunsan_seafood',
    name: '해신탕',
    category: '해산물',
    region: '군산시',
    address: '전라북도 군산시 해망로 155',
    coordinates: [35.9680, 126.7110],
    description: '신선한 해산물 요리 전문점',
    rating: 4.3,
    specialties: ['아구찜', '해물탕', '간장게장'],
    price_range: '25,000-40,000원',
    image: '/images/haesintang.jpg'
  },
  
  // 익산시 음식점
  {
    id: 'iksan_galbi',
    name: '익산왕갈비',
    category: '한식',
    region: '익산시',
    address: '전라북도 익산시 인북로 13길 24',
    coordinates: [36.0350, 127.0889],
    description: '익산 대표 갈비 맛집',
    rating: 4.2,
    specialties: ['왕갈비', '갈비탕', '냉면'],
    price_range: '18,000-30,000원',
    image: '/images/iksan_galbi.jpg'
  },
  
  // 정읍시 음식점
  {
    id: 'jeongeup_hanjeongsik',
    name: '내장산 한정식',
    category: '한식',
    region: '정읍시',
    address: '전라북도 정읍시 내장동 324',
    coordinates: [35.4980, 126.8900],
    description: '내장산 자락의 전통 한정식',
    rating: 4.4,
    specialties: ['산채정식', '버섯전골', '도토리묵'],
    price_range: '20,000-35,000원',
    image: '/images/naejangsan_hanjeongsik.jpg'
  },
  
  // 고창군 음식점
  {
    id: 'gochang_bokjip',
    name: '고창 복분자 맛집',
    category: '전통음식',
    region: '고창군',
    address: '전라북도 고창군 고창읍 중앙로 123',
    coordinates: [35.4340, 126.7020],
    description: '고창 특산품 복분자를 활용한 요리',
    rating: 4.1,
    specialties: ['복분자 불고기', '복분자 막걸리', '복분자 떡'],
    price_range: '15,000-25,000원',
    image: '/images/gochang_bokbunja.jpg'
  },
  
  // 부안군 음식점
  {
    id: 'buan_seafood',
    name: '변산 바다횟집',
    category: '해산물',
    region: '부안군',
    address: '전라북도 부안군 변산면 격포리 123',
    coordinates: [35.6150, 126.4890],
    description: '변산반도 신선한 해산물 전문점',
    rating: 4.3,
    specialties: ['모듬회', '매운탕', '조개구이'],
    price_range: '30,000-50,000원',
    image: '/images/buan_seafood.jpg'
  }
];

// 기본 라우트 - 모든 장소 조회 (관광지 + 음식점)
router.get('/', (req, res) => {
  try {
    const allPlaces = [
      ...touristAttractions.map(place => ({ ...place, type: 'attraction' })),
      ...restaurants.map(place => ({ ...place, type: 'restaurant' }))
    ];
    
    res.json({
      success: true,
      data: allPlaces,
      total: allPlaces.length
    });
  } catch (error) {
    console.error('장소 조회 오류:', error);
    res.status(500).json({ error: '장소 조회 중 오류가 발생했습니다.' });
  }
});

// 모든 장소 조회 (관광지 + 음식점) - 별칭
router.get('/all', (req, res) => {
  try {
    const allPlaces = [
      ...touristAttractions.map(place => ({ ...place, type: 'attraction' })),
      ...restaurants.map(place => ({ ...place, type: 'restaurant' }))
    ];
    
    res.json({
      success: true,
      data: allPlaces,
      total: allPlaces.length
    });
  } catch (error) {
    console.error('장소 조회 오류:', error);
    res.status(500).json({ error: '장소 조회 중 오류가 발생했습니다.' });
  }
});

// 관광지만 조회
router.get('/attractions', (req, res) => {
  try {
    const { region, category } = req.query;
    let filteredAttractions = [...touristAttractions];
    
    if (region) {
      filteredAttractions = filteredAttractions.filter(place => 
        place.region.includes(region)
      );
    }
    
    if (category) {
      filteredAttractions = filteredAttractions.filter(place => 
        place.category === category
      );
    }
    
    res.json({
      success: true,
      data: filteredAttractions,
      total: filteredAttractions.length
    });
  } catch (error) {
    console.error('관광지 조회 오류:', error);
    res.status(500).json({ error: '관광지 조회 중 오류가 발생했습니다.' });
  }
});

// 음식점만 조회
router.get('/restaurants', (req, res) => {
  try {
    const { region, category } = req.query;
    let filteredRestaurants = [...restaurants];
    
    if (region) {
      filteredRestaurants = filteredRestaurants.filter(place => 
        place.region.includes(region)
      );
    }
    
    if (category) {
      filteredRestaurants = filteredRestaurants.filter(place => 
        place.category === category
      );
    }
    
    res.json({
      success: true,
      data: filteredRestaurants,
      total: filteredRestaurants.length
    });
  } catch (error) {
    console.error('음식점 조회 오류:', error);
    res.status(500).json({ error: '음식점 조회 중 오류가 발생했습니다.' });
  }
});

// 권역별 장소 조회
router.get('/by-region', (req, res) => {
  try {
    const regions = {};
    
    // 관광지 분류
    touristAttractions.forEach(place => {
      if (!regions[place.region]) {
        regions[place.region] = { attractions: [], restaurants: [] };
      }
      regions[place.region].attractions.push(place);
    });
    
    // 음식점 분류
    restaurants.forEach(place => {
      if (!regions[place.region]) {
        regions[place.region] = { attractions: [], restaurants: [] };
      }
      regions[place.region].restaurants.push(place);
    });
    
    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('권역별 장소 조회 오류:', error);
    res.status(500).json({ error: '권역별 장소 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 장소 상세 정보 조회
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const attraction = touristAttractions.find(place => place.id === id);
    const restaurant = restaurants.find(place => place.id === id);
    
    const place = attraction || restaurant;
    
    if (!place) {
      return res.status(404).json({ error: '장소를 찾을 수 없습니다.' });
    }
    
    res.json({
      success: true,
      data: {
        ...place,
        type: attraction ? 'attraction' : 'restaurant'
      }
    });
  } catch (error) {
    console.error('장소 상세 조회 오류:', error);
    res.status(500).json({ error: '장소 상세 조회 중 오류가 발생했습니다.' });
  }
});

export default router;