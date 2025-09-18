import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const router = express.Router();

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 공공데이터포털 API 키
const OPEN_API_KEY = process.env.OPEN_API_KEY;

// 공공데이터포털 API 호출 함수들
async function getCategoryTourData(area = '', category = '') {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/CategoryTourService/getCategoryTour', {
      params: {
        ServiceKey: OPEN_API_KEY,
        Area: area,
        Category: category
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getTouristData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/jeonbuktourist/getJeonbukTourist', {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getThemeRestaurantData(theme = 'mood', search = 'A') {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/ThemeRestaurantService', {
      params: {
        serviceKey: OPEN_API_KEY,
        theme: theme,
        search: search
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getThemeRestaurantDetail(theme = 'mood', search = 'A') {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/ThemeRestaurantService/getThemeRestaurant', {
      params: {
        ServiceKey: OPEN_API_KEY,
        Theme: theme,
        Search: search
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getAreaRestaurantData(area = '12') {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/AreaRestaurantService/getAreaRestaurant', {
      params: {
        serviceKey: OPEN_API_KEY,
        Area: area
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getAreaRestaurantDetail(sno) {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/AreaRestaurantService/getAreaRestaurantDetail', {
      params: {
        serviceKey: OPEN_API_KEY,
        SNO: sno
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

// AI 여행 계획 생성 API
router.post('/generate', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 여행 계획 생성 시작 - 사용자 입력: "${req.body.userInput}"`);
  
  try {
    const { userInput, language = 'ko' } = req.body;

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({
        success: false,
        error: '여행에 대한 설명을 입력해주세요.'
      });
    }


    if (!process.env.GEMINI_API_KEY || !process.env.OPEN_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY와 OPEN_API_KEY를 설정해주세요.'
      });
    }


    // 첫 번째 Gemini 호출: 필요한 API와 파라미터 선정
    // 언어별 응답 설정
    const languageSettings = {
      ko: { response: '한국어로', instruction: '한국어로 응답해주세요.' },
      en: { response: 'in English', instruction: 'Please respond in English.' },
      ja: { response: '日本語で', instruction: '日本語で回答してください。' },
      zh: { response: '用中文', instruction: '请用中文回答。' }
    };

    const langSetting = languageSettings[language] || languageSettings['ko'];

    const apiSelectionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    console.log(`[${new Date().toISOString()}] 1단계: API 선정을 위한 Gemini 호출 시작`);
    const apiSelectionStartTime = Date.now();
    
    const apiSelectionPrompt = `${language === 'ko' ? '사용자 요구사항' : language === 'en' ? 'User Requirements' : language === 'ja' ? 'ユーザー要件' : '用户需求'}: "${userInput}"

${language === 'ko' ? '사용 가능한 전라북도 공공데이터 API들' : language === 'en' ? 'Available Jeollabuk-do Public Data APIs' : language === 'ja' ? '利用可能な全羅北道公共データAPI' : '可用的全罗北道公共数据API'}:
1. getTouristData - ${language === 'ko' ? '주요 관광지 목록' : language === 'en' ? 'Major Tourist Attractions List' : language === 'ja' ? '主要観光地リスト' : '主要景点列表'} (${language === 'ko' ? '파라미터 없음' : language === 'en' ? 'No parameters' : language === 'ja' ? 'パラメータなし' : '无参数'})
2. getCategoryTourData - ${language === 'ko' ? '분류별 관광 정보' : language === 'en' ? 'Categorized Tourism Information' : language === 'ja' ? 'カテゴリ別観光情報' : '分类旅游信息'} (${language === 'ko' ? '파라미터' : language === 'en' ? 'parameters' : language === 'ja' ? 'パラメータ' : '参数'}: area, category)
3. getThemeRestaurantData - ${language === 'ko' ? '테마별 음식점 목록' : language === 'en' ? 'Theme-based Restaurant List' : language === 'ja' ? 'テーマ別レストランリスト' : '主题餐厅列表'} (${language === 'ko' ? '파라미터' : language === 'en' ? 'parameters' : language === 'ja' ? 'パラメータ' : '参数'}: theme, search)
4. getThemeRestaurantDetail - ${language === 'ko' ? '테마별 음식점 상세정보' : language === 'en' ? 'Theme Restaurant Details' : language === 'ja' ? 'テーマレストラン詳細情報' : '主题餐厅详细信息'} (${language === 'ko' ? '파라미터' : language === 'en' ? 'parameters' : language === 'ja' ? 'パラメータ' : '参数'}: theme, search)
5. getAreaRestaurantData - ${language === 'ko' ? '권역별 음식점 목록' : language === 'en' ? 'Area-based Restaurant List' : language === 'ja' ? '地域別レストランリスト' : '地区餐厅列表'} (${language === 'ko' ? '파라미터' : language === 'en' ? 'parameter' : language === 'ja' ? 'パラメータ' : '参数'}: area)
6. getAreaRestaurantDetail - ${language === 'ko' ? '권역별 음식점 상세정보' : language === 'en' ? 'Area Restaurant Details' : language === 'ja' ? '地域レストラン詳細情報' : '地区餐厅详细信息'} (${language === 'ko' ? '파라미터' : language === 'en' ? 'parameter' : language === 'ja' ? 'パラメータ' : '参数'}: sno)

${language === 'ko' ? '사용자의 요구사항에 맞는 API들과 필요한 파라미터를 선정해주세요.' : language === 'en' ? 'Select APIs and parameters that match the user requirements.' : language === 'ja' ? 'ユーザーの要件に合ったAPIと必要なパラメータを選択してください。' : '选择符合用户需求的API和参数。'}
${language === 'ko' ? '응답 형식' : language === 'en' ? 'Response format' : language === 'ja' ? '応答形式' : '响应格式'}:
{
  "selectedAPIs": [
    {
      "apiName": "getTouristData",
      "parameters": {},
      "reason": "${language === 'ko' ? '선정 이유' : language === 'en' ? 'Selection reason' : language === 'ja' ? '選択理由' : '选择理由'}"
    }
  ]
}`;

    const apiSelectionResult = await apiSelectionModel.generateContent(apiSelectionPrompt);
    const apiSelectionResponse = await apiSelectionResult.response;
    const apiSelectionText = apiSelectionResponse.text();
    
    const apiSelectionEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] 1단계 완료: API 선정 Gemini 호출 - 소요시간: ${apiSelectionEndTime - apiSelectionStartTime}ms`);
    
    
    // API 선정 결과 파싱
    let selectedAPIs = [];
    try {
      const jsonMatch = apiSelectionText.match(/```json\s*([\s\S]*?)\s*```/) || apiSelectionText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : apiSelectionText;
      const parsedSelection = JSON.parse(jsonText);
      selectedAPIs = parsedSelection.selectedAPIs || [];
    } catch (parseError) {
      selectedAPIs = [
        { apiName: 'getTouristData', parameters: {} },
        { apiName: 'getCategoryTourData', parameters: { area: '', category: '' } },
        { apiName: 'getThemeRestaurantData', parameters: { theme: 'mood', search: '조용' } },
        { apiName: 'getAreaRestaurantData', parameters: { area: '12' } }
      ];
    }

    // 선정된 API들 호출
    console.log(`[${new Date().toISOString()}] 2단계: 공공데이터 API 호출 시작 - ${selectedAPIs.length}개 API 호출 예정`);
    const apiCallStartTime = Date.now();
    const apiResults = {};
    
    for (const api of selectedAPIs) {
      const singleApiStartTime = Date.now();
      try {
        let result = null;
        switch (api.apiName) {
          case 'getTouristData':
            result = await getTouristData();
            break;
          case 'getCategoryTourData':
            result = await getCategoryTourData(api.parameters.area, api.parameters.category);
            break;
          case 'getThemeRestaurantData':
            result = await getThemeRestaurantData(api.parameters.theme, api.parameters.search);
            break;
          case 'getThemeRestaurantDetail':
            result = await getThemeRestaurantDetail(api.parameters.theme, api.parameters.search);
            break;
          case 'getAreaRestaurantData':
            result = await getAreaRestaurantData(api.parameters.area);
            break;
          case 'getAreaRestaurantDetail':
            result = await getAreaRestaurantDetail(api.parameters.sno);
            break;
        }
        const singleApiEndTime = Date.now();
        console.log(`[${new Date().toISOString()}] API 호출 완료: ${api.apiName} - 소요시간: ${singleApiEndTime - singleApiStartTime}ms`);
        apiResults[api.apiName] = result;
      } catch (error) {
        const singleApiEndTime = Date.now();
        console.log(`[${new Date().toISOString()}] API 호출 실패: ${api.apiName} - 소요시간: ${singleApiEndTime - singleApiStartTime}ms - 오류: ${error.message}`);
        apiResults[api.apiName] = null;
      }
    }
    
    const apiCallEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] 2단계 완료: 공공데이터 API 호출 - 총 소요시간: ${apiCallEndTime - apiCallStartTime}ms`);

    // 두 번째 Gemini 호출: 실제 여행 계획 생성
    console.log(`[${new Date().toISOString()}] 3단계: 여행 계획 생성을 위한 Gemini 호출 시작`);
    const planGenerationStartTime = Date.now();
    
    const planGenerationModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // API 결과를 문자열로 변환
    const apiDataString = JSON.stringify(apiResults, null, 2);

    const prompt = `${language === 'ko' ? '당신은 전라북도 여행 전문가입니다. 사용자의 요구사항에 맞는 맞춤형 여행 계획을 만들어주세요.' : language === 'en' ? 'You are a Jeollabuk-do travel expert. Create a customized travel plan that meets the user requirements.' : language === 'ja' ? 'あなたは全羅北道の旅行専門家です。ユーザーの要件に合ったカスタマイズされた旅行計画を作成してください。' : '您是全罗北道旅行专家。请创建符合用户需求的定制旅行计划。'}

${language === 'ko' ? '사용자 요구사항' : language === 'en' ? 'User Requirements' : language === 'ja' ? 'ユーザー要件' : '用户需求'}: "${userInput}"

${language === 'ko' ? '다음은 사용자 요구사항에 맞게 선정하여 수집한 전라북도의 관광 정보입니다:' : language === 'en' ? 'The following is tourism information from Jeollabuk-do that was selected and collected to match the user requirements:' : language === 'ja' ? '以下は、ユーザーの要件に合わせて選択・収集された全羅北道の観光情報です：' : '以下是根据用户需求选择和收集的全罗北道旅游信息：'}

${apiDataString}

${language === 'ko' ? '위 정보를 바탕으로 사용자의 요구사항에 맞는 1-3일 여행 계획을 JSON 형태로 만들어주세요.' : language === 'en' ? 'Based on the above information, create a 1-3 day travel plan in JSON format that meets the user requirements.' : language === 'ja' ? '上記の情報に基づいて、ユーザーの要件に合った1-3日の旅行計画をJSON形式で作成してください。' : '根据上述信息，以JSON格式创建符合用户需求的1-3天旅行计划。'}

${language === 'ko' ? '중요: 반드시 다음 JSON 형식으로만 응답해주세요. 다른 텍스트나 설명은 포함하지 마세요.' : language === 'en' ? 'Important: Please respond ONLY in the following JSON format. Do not include any other text or explanations.' : language === 'ja' ? '重要：以下のJSON形式でのみ応答してください。他のテキストや説明は含めないでください。' : '重要：请仅以以下JSON格式回复。不要包含任何其他文本或说明。'}

\`\`\`json
{
  "title": "${language === 'ko' ? '여행 계획 제목' : language === 'en' ? 'Travel Plan Title' : language === 'ja' ? '旅行計画タイトル' : '旅行计划标题'}",
  "summary": "${language === 'ko' ? '여행 계획 요약' : language === 'en' ? 'Travel Plan Summary' : language === 'ja' ? '旅行計画要約' : '旅行计划摘要'}",
  "duration": "${language === 'ko' ? '여행 기간' : language === 'en' ? 'Travel Duration' : language === 'ja' ? '旅行期間' : '旅行时间'}",
  "days": [
    {
      "day": 1,
      "title": "${language === 'ko' ? '1일차 제목' : language === 'en' ? 'Day 1 Title' : language === 'ja' ? '1日目タイトル' : '第一天标题'}",
      "activities": [
        {
          "time": "09:00",
          "location": "${language === 'ko' ? '장소명' : language === 'en' ? 'Location Name' : language === 'ja' ? '場所名' : '地点名称'}",
          "description": "${language === 'ko' ? '활동 설명' : language === 'en' ? 'Activity Description' : language === 'ja' ? '活動説明' : '活动描述'}",
          "type": "${language === 'ko' ? '관광지/음식점/체험' : language === 'en' ? 'Tourist Spot/Restaurant/Experience' : language === 'ja' ? '観光地/レストラン/体験' : '景点/餐厅/体验'}",
          "coordinates": [위도, 경도]
        }
      ]
    }
  ],
  "recommendations": {
    "food": ["${language === 'ko' ? '추천 음식점들' : language === 'en' ? 'Recommended Restaurants' : language === 'ja' ? 'おすすめレストラン' : '推荐餐厅'}"],
    "attractions": ["${language === 'ko' ? '추천 관광지들' : language === 'en' ? 'Recommended Attractions' : language === 'ja' ? 'おすすめ観光地' : '推荐景点'}"],
    "tips": ["${language === 'ko' ? '여행 팁들' : language === 'en' ? 'Travel Tips' : language === 'ja' ? '旅行のコツ' : '旅行提示'}"]
  }
}
\`\`\`

${language === 'ko' ? '실제 API 데이터에서 나온 장소명과 음식점명을 정확히 사용해주세요.' : language === 'en' ? 'Please use the exact place names and restaurant names from the actual API data.' : language === 'ja' ? '実際のAPIデータから得られた場所名とレストラン名を正確に使用してください。' : '请准确使用从实际API数据中获得的场所名称和餐厅名称。'} ${langSetting.instruction}

${language === 'ko' ? '중요: 각 활동에는 반드시 정확한 좌표(coordinates: [위도, 경도])를 포함해주세요.' : language === 'en' ? 'Important: Each activity must include accurate coordinates (coordinates: [latitude, longitude]).' : language === 'ja' ? '重要：各活動には正確な座標（coordinates: [緯度, 経度]）を含めてください。' : '重要：每个活动必须包含准确的坐标（coordinates: [纬度, 经度]）。'}

${language === 'ko' ? '응답은 반드시 위의 JSON 형식으로만 해주세요. 다른 설명이나 텍스트는 포함하지 마세요.' : language === 'en' ? 'Please respond ONLY in the JSON format above. Do not include any other explanations or text.' : language === 'ja' ? '上記のJSON形式でのみ応答してください。他の説明やテキストは含めないでください。' : '请仅以上述JSON格式回复。不要包含任何其他说明或文本。'}`;

    const result = await planGenerationModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const planGenerationEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] 3단계 완료: 여행 계획 생성 Gemini 호출 - 소요시간: ${planGenerationEndTime - planGenerationStartTime}ms`);

    // JSON 파싱 시도
    console.log(`[${new Date().toISOString()}] 4단계: JSON 파싱 및 데이터 처리 시작`);
    const dataProcessingStartTime = Date.now();
    
    // 디버깅을 위한 원본 응답 로깅
    console.log(`[${new Date().toISOString()}] Gemini 원본 응답 (처음 500자): ${text.substring(0, 500)}`);
    
    let travelPlan;
    try {
      // 여러 패턴으로 JSON 추출 시도
      let jsonText = '';
      
      // 패턴 1: ```json ... ``` 형태
      let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
        console.log(`[${new Date().toISOString()}] 패턴 1로 JSON 추출 성공`);
      } else {
        // 패턴 2: ``` ... ``` 형태 (json 없이)
        jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
          console.log(`[${new Date().toISOString()}] 패턴 2로 JSON 추출 성공`);
        } else {
          // 패턴 3: { 로 시작하는 JSON 찾기
          const jsonStart = text.indexOf('{');
          if (jsonStart !== -1) {
            jsonText = text.substring(jsonStart);
            console.log(`[${new Date().toISOString()}] 패턴 3으로 JSON 추출 시도`);
          } else {
            // 패턴 4: 전체 텍스트 사용
            jsonText = text;
            console.log(`[${new Date().toISOString()}] 패턴 4로 전체 텍스트 사용`);
          }
        }
      }
      
      // JSON 텍스트 정리
      jsonText = jsonText.trim();
      
      // 일반적인 JSON 파싱 문제 해결
      // 1. 마지막 불필요한 문자 제거
      jsonText = jsonText.replace(/[,\s]*$/, '');
      
      // 2. 마지막 } 뒤의 내용 제거
      const lastBrace = jsonText.lastIndexOf('}');
      if (lastBrace !== -1) {
        jsonText = jsonText.substring(0, lastBrace + 1);
      }
      
      // 3. 주석 제거 (// 또는 /* */ 형태)
      jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
      jsonText = jsonText.replace(/\/\/.*$/gm, '');
      
      // 4. 줄바꿈 정리
      jsonText = jsonText.replace(/\n\s*/g, ' ');
      
      console.log(`[${new Date().toISOString()}] 정리된 JSON 텍스트 (처음 300자): ${jsonText.substring(0, 300)}`);
      
      travelPlan = JSON.parse(jsonText);
      console.log(`[${new Date().toISOString()}] JSON 파싱 성공`);
      
      // 파싱된 데이터 검증
      if (!travelPlan.title || !travelPlan.days || !Array.isArray(travelPlan.days)) {
        throw new Error('필수 필드가 누락되었습니다 (title, days)');
      }
      
      console.log(`[${new Date().toISOString()}] 파싱된 데이터 검증 완료 - 제목: ${travelPlan.title}, 일정 수: ${travelPlan.days.length}`);
      
    } catch (parseError) {
      console.log(`[${new Date().toISOString()}] JSON 파싱 실패 - 오류: ${parseError.message}`);
      console.log(`[${new Date().toISOString()}] 파싱 시도한 텍스트: ${jsonText ? jsonText.substring(0, 200) : 'N/A'}`);
      
      // 기본 데이터 사용
      travelPlan = {
        title: "전라북도 맞춤 여행",
        summary: userInput,
        duration: "1-2일",
        days: [{
          day: 1,
          title: "전라북도 여행",
          activities: [{
            time: "09:00",
            location: "전주 한옥마을",
            description: "전통 한옥과 문화 체험",
            type: "관광지",
            coordinates: [35.8242, 127.1480]
          }]
        }],
        recommendations: {
          food: ["전주 비빔밥", "한정식"],
          attractions: ["전주 한옥마을", "경기전"],
          tips: ["편안한 신발을 신으세요", "카메라를 준비하세요"]
        },
        rawResponse: text,
        parseError: parseError.message
      };
    }

    // 여행지 순서 최적화 및 이동 시간 계산 함수
    console.log(`[${new Date().toISOString()}] 5단계: 여행지 순서 최적화 및 이동시간 계산 시작`);
    const optimizationStartTime = Date.now();
    
    function calculateDistance(coord1, coord2) {
      if (!coord1 || !coord2) return 0;
      const [lat1, lon1] = coord1;
      const [lat2, lon2] = coord2;
      const R = 6371; // 지구 반지름 (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    function calculateTravelTime(distance) {
      // 평균 차량 속도 40km/h로 가정
      const speed = 40;
      const timeInHours = distance / speed;
      return Math.round(timeInHours * 60); // 분 단위로 반환
    }

    function optimizeTravelOrder(activities) {
      if (!activities || activities.length <= 1) return activities;
      
      const optimized = [...activities];
      const hasCoordinates = optimized.filter(activity => activity.coordinates && activity.coordinates.length === 2);
      
      if (hasCoordinates.length < 2) return optimized;
      
      // TSP (Traveling Salesman Problem) 간단한 해결책
      const sorted = [hasCoordinates[0]];
      const remaining = hasCoordinates.slice(1);
      
      while (remaining.length > 0) {
        const current = sorted[sorted.length - 1];
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        remaining.forEach((location, index) => {
          const distance = calculateDistance(current.coordinates, location.coordinates);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });
        
        const nearest = remaining.splice(nearestIndex, 1)[0];
        sorted.push(nearest);
      }
      
      // 원본 순서를 유지하면서 좌표가 있는 것들만 재정렬
      const result = [];
      let sortedIndex = 0;
      
      optimized.forEach(activity => {
        if (activity.coordinates && activity.coordinates.length === 2) {
          result.push({
            ...sorted[sortedIndex],
            travelTime: sortedIndex > 0 ? calculateTravelTime(
              calculateDistance(sorted[sortedIndex - 1].coordinates, sorted[sortedIndex].coordinates)
            ) : 0
          });
          sortedIndex++;
        } else {
          result.push(activity);
        }
      });
      
      return result;
    }

    // 여행 계획을 일차별로 평면화하고 순서 최적화
    let flattenedPlan = [];
    if (travelPlan.days && Array.isArray(travelPlan.days)) {
      travelPlan.days.forEach((day, dayIndex) => {
        if (day.activities && Array.isArray(day.activities)) {
          // 하루 내 활동들의 순서를 최적화
          const optimizedActivities = optimizeTravelOrder(day.activities);
          
          optimizedActivities.forEach((activity, activityIndex) => {
            flattenedPlan.push({
              time: activity.time || `${dayIndex + 1}일차 ${activityIndex + 1}번째`,
              title: activity.location || activity.title || `활동 ${activityIndex + 1}`,
              description: activity.description || '',
              location: activity.location || '',
              duration: activity.duration || '',
              cost: activity.cost || '',
              type: activity.type || '활동',
              day: day.day || dayIndex + 1,
              coordinates: activity.coordinates || null,
              travelTime: activity.travelTime || 0, // 이전 장소로부터의 이동 시간 (분)
              id: `${dayIndex}-${activityIndex}`
            });
          });
        }
      });
    }
    
    const optimizationEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] 5단계 완료: 여행지 순서 최적화 및 이동시간 계산 - 소요시간: ${optimizationEndTime - optimizationStartTime}ms`);


    // 클라이언트에서 사용할 데이터 구조 통일
    const responseData = {
      success: true,
      data: flattenedPlan, // 평면화된 계획 (클라이언트 UI용)
      plan: flattenedPlan, // 평면화된 계획 (클라이언트 UI용)
      originalData: travelPlan, // 원본 구조 (메타데이터 포함)
      planInfo: {
        title: travelPlan.title || '전라북도 여행 계획',
        summary: travelPlan.summary || userInput,
        duration: travelPlan.duration || '1-2일'
      },
      message: '여행 계획이 성공적으로 생성되었습니다!'
    };

    res.json(responseData);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: '여행 계획 생성 중 오류가 발생했습니다: ' + error.message
    });
  }
});

// 구글 맵 Places API를 사용한 장소 검색
router.get('/search', async (req, res) => {
  try {
    const { query = '', location = '35.7175,127.1530', radius = 50000, type = '' } = req.query;
    
    if (!query.trim()) {
      return res.json({
        success: true,
        data: [],
        message: '검색어를 입력해주세요.'
      });
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API 키가 설정되지 않음. 샘플 데이터로 폴백');
      
      // API 키가 없을 때 샘플 데이터 반환
      const sampleResults = [
        {
          id: 'sample_1',
          title: `${query} - 전주 한옥마을`,
          location: '전주시 완산구 기린대로 99',
          coordinates: [35.8154, 127.1534],
          description: '전통 한옥이 잘 보존된 마을입니다.',
          type: '관광지',
          rating: 4.5,
          price_level: null,
          photos: [],
          opening_hours: null,
          source: 'sample_data'
        },
        {
          id: 'sample_2',
          title: `${query} - 전주 비빔밥`,
          location: '전주시 완산구 한지길 89',
          coordinates: [35.8167, 127.1544],
          description: '전주 비빔밥의 진수를 맛볼 수 있는 곳입니다.',
          type: '음식점',
          rating: 4.3,
          price_level: 2,
          photos: [],
          opening_hours: null,
          source: 'sample_data'
        },
        {
          id: 'sample_3',
          title: `${query} - 덕진공원`,
          location: '전주시 덕진구 덕진동',
          coordinates: [35.8294, 127.1331],
          description: '아름다운 연못과 정원이 있는 공원입니다.',
          type: '공원',
          rating: 4.2,
          price_level: null,
          photos: [],
          opening_hours: null,
          source: 'sample_data'
        }
      ];

      return res.json({
        success: true,
        data: sampleResults,
        message: `샘플 데이터: ${sampleResults.length}개의 장소를 찾았습니다. (Google Maps API 키를 설정하면 실제 데이터를 검색할 수 있습니다)`
      });
    }

    console.log(`[${new Date().toISOString()}] 구글 맵 장소 검색 시작 - 검색어: "${query}"`);
    
    // Google Places API 검색 URL 구성
    const placesUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const params = new URLSearchParams({
      query: `${query} 전라북도`,
      key: process.env.GOOGLE_MAPS_API_KEY,
      language: 'ko',
      region: 'kr'
    });

    // 위치와 반경이 제공된 경우 추가
    if (location) {
      params.append('location', location);
      params.append('radius', radius.toString());
    }

    // 타입이 제공된 경우 추가
    if (type) {
      params.append('type', type);
    }

    const response = await axios.get(`${placesUrl}?${params.toString()}`, {
      timeout: 10000
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API 오류: ${response.data.status}`);
    }

    const searchResults = response.data.results.map(place => ({
      id: place.place_id,
      title: place.name,
      location: place.formatted_address,
      coordinates: place.geometry?.location ? [place.geometry.location.lat, place.geometry.location.lng] : null,
      description: place.formatted_address,
      type: getPlaceType(place.types),
      rating: place.rating || 0,
      price_level: place.price_level || null,
      photos: place.photos || [],
      opening_hours: place.opening_hours || null,
      source: 'google_places'
    }));

    console.log(`[${new Date().toISOString()}] 구글 맵 검색 완료 - 결과: ${searchResults.length}개`);

    res.json({
      success: true,
      data: searchResults,
      message: `${searchResults.length}개의 장소를 찾았습니다.`
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 구글 맵 검색 오류:`, error);
    res.status(500).json({
      success: false,
      error: '장소 검색 중 오류가 발생했습니다: ' + error.message
    });
  }
});

// Google Places API 장소 타입을 한국어로 변환
function getPlaceType(types) {
  if (!types || types.length === 0) return '기타';
  
  const typeMap = {
    'tourist_attraction': '관광지',
    'amusement_park': '관광지',
    'museum': '박물관',
    'art_gallery': '미술관',
    'zoo': '동물원',
    'aquarium': '수족관',
    'restaurant': '음식점',
    'food': '음식점',
    'cafe': '카페',
    'bar': '바',
    'lodging': '숙소',
    'hotel': '호텔',
    'shopping_mall': '쇼핑몰',
    'store': '상점',
    'park': '공원',
    'natural_feature': '자연경관',
    'church': '교회',
    'temple': '사원',
    'hospital': '병원',
    'school': '학교',
    'university': '대학교',
    'gas_station': '주유소',
    'atm': 'ATM',
    'bank': '은행',
    'post_office': '우체국',
    'police': '경찰서',
    'fire_station': '소방서'
  };

  // 첫 번째 매칭되는 타입을 반환
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  return '기타';
}

// 여행 계획에 장소 추가 API
router.post('/add-place', async (req, res) => {
  try {
    const { place, planItems = [] } = req.body;
    
    if (!place || !place.id || !place.title) {
      return res.status(400).json({
        success: false,
        error: '유효한 장소 정보를 제공해주세요.'
      });
    }

    console.log(`[${new Date().toISOString()}] 여행 계획에 장소 추가 - 장소: "${place.title}"`);

    // 새로운 여행 계획 항목 생성
    const newPlanItem = {
      id: `item_${Date.now()}_${place.id}`,
      title: place.title,
      location: place.location || '주소 정보 없음',
      coordinates: place.coordinates || null,
      description: place.description || '',
      type: place.type || '장소',
      time: `${planItems.length + 1}번째`,
      travelTime: 0,
      day: 1,
      source: place.source || 'search'
    };

    // 이동 시간 계산 (이전 장소와의 거리 기반)
    if (planItems.length > 0 && place.coordinates && planItems[planItems.length - 1].coordinates) {
      const lastItem = planItems[planItems.length - 1];
      const distance = calculateDistance(
        lastItem.coordinates[0], lastItem.coordinates[1],
        place.coordinates[0], place.coordinates[1]
      );
      newPlanItem.travelTime = Math.round(distance / 60); // 분 단위로 변환
    }

    console.log(`[${new Date().toISOString()}] 장소 추가 완료 - ID: ${newPlanItem.id}`);

    res.json({
      success: true,
      data: newPlanItem,
      message: '장소가 여행 계획에 추가되었습니다.'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 장소 추가 오류:`, error);
    res.status(500).json({
      success: false,
      error: '장소 추가 중 오류가 발생했습니다: ' + error.message
    });
  }
});

// 거리 계산 함수 (Haversine 공식)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // km 단위
}

export default router;