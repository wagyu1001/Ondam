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
async function getCategoryTourData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/CategoryTourService/getCategoryTour', {
      params: {
        serviceKey: OPEN_API_KEY,
        type: 'json',
        numOfRows: 100,
        pageNo: 1
      },
      timeout: 10000 // 10초 타임아웃
    });
    console.log('분류별 관광 정보 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('분류별 관광 정보 API 오류:', error.response?.data || error.message);
    return null;
  }
}

async function getTouristData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/jeonbuktourist', {
      params: {
        serviceKey: OPEN_API_KEY,
        type: 'json',
        numOfRows: 100,
        pageNo: 1
      },
      timeout: 10000
    });
    console.log('주요 관광지 정보 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('주요 관광지 정보 API 오류:', error.response?.data || error.message);
    return null;
  }
}

async function getThemeRestaurantData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/ThemeRestaurantService/getThemeRestaurant', {
      params: {
        serviceKey: OPEN_API_KEY,
        type: 'json',
        numOfRows: 100,
        pageNo: 1
      },
      timeout: 10000
    });
    console.log('테마별 음식점 정보 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('테마별 음식점 정보 API 오류:', error.response?.data || error.message);
    return null;
  }
}

async function getAreaRestaurantData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/AreaRestaurantService/getAreaRestaurant', {
      params: {
        serviceKey: OPEN_API_KEY,
        type: 'json',
        numOfRows: 100,
        pageNo: 1
      },
      timeout: 10000
    });
    console.log('권역별 음식점 정보 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('권역별 음식점 정보 API 오류:', error.response?.data || error.message);
    return null;
  }
}

async function getLocalFoodData() {
  try {
    const response = await axios.get('https://apis.data.go.kr/6450000/JeonbukRestaurantService', {
      params: {
        serviceKey: OPEN_API_KEY,
        type: 'json',
        numOfRows: 100,
        pageNo: 1
      },
      timeout: 10000
    });
    console.log('향토음식점 정보 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('향토음식점 정보 API 오류:', error.response?.data || error.message);
    return null;
  }
}

// AI 여행 계획 생성 API
router.post('/generate', async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({
        success: false,
        error: '여행에 대한 설명을 입력해주세요.'
      });
    }

    // API 키 확인
    if (!process.env.GEMINI_API_KEY || !process.env.OPEN_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY와 OPEN_API_KEY를 설정해주세요.'
      });
    }

    console.log('API 키 확인 완료 - Gemini:', !!process.env.GEMINI_API_KEY, 'OpenAPI:', !!process.env.OPEN_API_KEY);

    // 모든 공공데이터 API에서 정보 수집
    const [categoryTour, touristData, themeRestaurant, areaRestaurant, localFood] = await Promise.all([
      getCategoryTourData(),
      getTouristData(),
      getThemeRestaurantData(),
      getAreaRestaurantData(),
      getLocalFoodData()
    ]);

    // 데이터 정리 및 통합
    console.log('API 응답 데이터 확인:');
    console.log('CategoryTour:', categoryTour ? 'Success' : 'Failed');
    console.log('TouristData:', touristData ? 'Success' : 'Failed');
    console.log('ThemeRestaurant:', themeRestaurant ? 'Success' : 'Failed');
    console.log('AreaRestaurant:', areaRestaurant ? 'Success' : 'Failed');
    console.log('LocalFood:', localFood ? 'Success' : 'Failed');

    const jeonbukData = {
      categoryTour: categoryTour?.response?.body?.items?.item || categoryTour?.body?.items?.item || [],
      touristData: touristData?.response?.body?.items?.item || touristData?.body?.items?.item || [],
      themeRestaurant: themeRestaurant?.response?.body?.items?.item || themeRestaurant?.body?.items?.item || [],
      areaRestaurant: areaRestaurant?.response?.body?.items?.item || areaRestaurant?.body?.items?.item || [],
      localFood: localFood?.response?.body?.items?.item || localFood?.body?.items?.item || []
    };

    console.log('데이터 개수:', {
      categoryTour: jeonbukData.categoryTour.length,
      touristData: jeonbukData.touristData.length,
      themeRestaurant: jeonbukData.themeRestaurant.length,
      areaRestaurant: jeonbukData.areaRestaurant.length,
      localFood: jeonbukData.localFood.length
    });

    // Gemini API를 사용하여 여행 계획 생성
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
당신은 전라북도 여행 전문가입니다. 사용자의 요구사항에 맞는 맞춤형 여행 계획을 만들어주세요.

사용자 요구사항: "${userInput}"

다음은 전라북도의 관광 정보입니다:

관광지 정보:
${JSON.stringify(jeonbukData.touristData.slice(0, 20), null, 2)}

분류별 관광 정보:
${JSON.stringify(jeonbukData.categoryTour.slice(0, 15), null, 2)}

테마별 음식점:
${JSON.stringify(jeonbukData.themeRestaurant.slice(0, 15), null, 2)}

권역별 음식점:
${JSON.stringify(jeonbukData.areaRestaurant.slice(0, 15), null, 2)}

향토음식점:
${JSON.stringify(jeonbukData.localFood.slice(0, 10), null, 2)}

위 정보를 바탕으로 사용자의 요구사항에 맞는 1-3일 여행 계획을 JSON 형태로 만들어주세요. 

응답 형식:
{
  "title": "여행 계획 제목",
  "summary": "여행 계획 요약",
  "duration": "여행 기간",
  "days": [
    {
      "day": 1,
      "title": "1일차 제목",
      "activities": [
        {
          "time": "09:00",
          "location": "장소명",
          "description": "활동 설명",
          "type": "관광지/음식점/체험"
        }
      ]
    }
  ],
  "recommendations": {
    "food": ["추천 음식점들"],
    "attractions": ["추천 관광지들"],
    "tips": ["여행 팁들"]
  },
  "budget": {
    "estimated": "예상 비용",
    "breakdown": "비용 세부사항"
  }
}

실제 API 데이터에서 나온 장소명과 음식점명을 정확히 사용해주세요. 한국어로 응답해주세요.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱 시도
    let travelPlan;
    try {
      // JSON 부분만 추출 (```json으로 감싸진 경우 대비)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      travelPlan = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // JSON 파싱 실패 시 기본 구조로 반환
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
            type: "관광지"
          }]
        }],
        recommendations: {
          food: ["전주 비빔밥", "한정식"],
          attractions: ["전주 한옥마을", "경기전"],
          tips: ["편안한 신발을 신으세요", "카메라를 준비하세요"]
        },
        budget: {
          estimated: "5-10만원",
          breakdown: "교통비, 식비, 입장료 포함"
        },
        rawResponse: text
      };
    }

    // 여행 계획을 일차별로 평면화하여 클라이언트에서 쉽게 표시할 수 있도록 변환
    let flattenedPlan = [];
    if (travelPlan.days && Array.isArray(travelPlan.days)) {
      travelPlan.days.forEach((day, dayIndex) => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach((activity, activityIndex) => {
            flattenedPlan.push({
              time: activity.time || `${dayIndex + 1}일차 ${activityIndex + 1}번째`,
              title: activity.location || activity.title || `활동 ${activityIndex + 1}`,
              description: activity.description || '',
              location: activity.location || '',
              duration: activity.duration || '',
              cost: activity.cost || '',
              type: activity.type || '활동',
              day: day.day || dayIndex + 1
            });
          });
        }
      });
    }

    console.log('생성된 여행 계획:', {
      original: travelPlan,
      flattened: flattenedPlan
    });

    res.json({
      success: true,
      data: flattenedPlan.length > 0 ? flattenedPlan : travelPlan,
      plan: flattenedPlan.length > 0 ? flattenedPlan : travelPlan,
      originalData: travelPlan, // 원본 데이터 (title, summary, duration 등 포함)
      planInfo: travelPlan, // 호환성을 위한 별칭
      message: '여행 계획이 성공적으로 생성되었습니다!'
    });

  } catch (error) {
    console.error('여행 계획 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '여행 계획 생성 중 오류가 발생했습니다: ' + error.message
    });
  }
});

export default router;
