<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let mapContainer: HTMLDivElement;
	let map: any;
	let L: any;
	let isLoading = true;

	// 모달 및 사이드바 상태 관리
	let showAiModal = false;
	let showSidebar = false;
	let aiInput = '';
	
	// 여행 계획 상태 관리
	let travelPlanItems: any[] = [];
	let travelPlanInfo: any = {};
	let showTravelPlan = false;
	let mapMarkers: any[] = [];
	let routeLines: any[] = []; // 경로 라인들을 저장할 배열
	let arrowMarkers: any[] = []; // 화살표 마커들을 저장할 배열
	let highlightedMarker: any = null;
	
	// 다국어 지원
	let currentLanguage = 'ko';
	let showLanguageMenu = false;
	
	// 검색 관련 상태
	let showSearchModal = false;
	let searchQuery = '';
	let searchResults: any[] = [];
	let isSearching = false;
	

	
	// 클립보드 복사 관련 상태
	let showCopySuccess = false;
	
	// 다국어 텍스트
	const texts = {
		ko: {
			logoSubtitle: '전라북도 여행의 시작',
			aiGenerate: 'AI로 생성',
			freeTravel: '자유 여행',
			aiModalTitle: '어떤 여행을 만들고 싶으신가요?',
			aiPlaceholder: '예시) 가족과 함께하는 전주 여행, 맛집과 전통문화 체험을 원해요',
			generatePlan: '계획 생성하기',
			close: '닫기',
			addSchedule: '일정을 추가해 보세요.',
			travelPlanTitle: '여행 계획',
			language: '언어',
			loading: '여행 계획 생성 중...',
			step1: '요구사항 분석',
			step2: '데이터 수집',
			step3: '계획 생성',
			searchPlace: '여행지 검색',
			searchPlaceholder: '검색할 여행지를 입력하세요',
			searchResults: '검색 결과',
			addToPlan: '일정에 추가',
			noResults: '검색 결과가 없습니다',
			optimizeRoute: '최적 경로로 재정렬',
			optimizeRouteTitle: '최적 방문 순서',
			optimizeRouteDesc: '여행지들을 가장 효율적인 순서로 재정렬하시겠습니까?',
			applyOptimization: '최적화 적용',
			cancel: '취소',
			copyPlan: '여행 계획 복사',
			copySuccess: '여행 계획이 클립보드에 복사되었습니다!',
			copyError: '복사에 실패했습니다.',

		},
		en: {
			logoSubtitle: 'Start of Jeollabuk-do Travel',
			aiGenerate: 'AI Generate',
			freeTravel: 'Free Travel',
			aiModalTitle: 'What kind of trip would you like to create?',
			aiPlaceholder: 'Example) A family trip to Jeonju, wanting to experience delicious food and traditional culture',
			generatePlan: 'Generate Plan',
			close: 'Close',
			addSchedule: 'Add a schedule.',
			travelPlanTitle: 'Travel Plan',
			language: 'Language',
			loading: 'Generating travel plan...',
			step1: 'Analyzing requirements',
			step2: 'Collecting data',
			step3: 'Generating plan',
			searchPlace: 'Search Places',
			searchPlaceholder: 'Enter a place to search',
			searchResults: 'Search Results',
			addToPlan: 'Add to Plan',
			noResults: 'No results found',
			optimizeRoute: 'Optimize Route',
			optimizeRouteTitle: 'Optimal Visit Order',
			optimizeRouteDesc: 'Would you like to reorder the places in the most efficient order?',
			applyOptimization: 'Apply Optimization',
			cancel: 'Cancel',
			copyPlan: 'Copy Travel Plan',
			copySuccess: 'Travel plan copied to clipboard!',
			copyError: 'Failed to copy.',

		},
		ja: {
			logoSubtitle: '全羅北道旅行の始まり',
			aiGenerate: 'AI生成',
			freeTravel: 'フリーツアー',
			aiModalTitle: 'どのような旅行を作りたいですか？',
			aiPlaceholder: '例）家族と一緒の全州旅行、美味しい食べ物と伝統文化体験を希望します',
			generatePlan: '計画作成',
			close: '閉じる',
			addSchedule: 'スケジュールを追加してください。',
			travelPlanTitle: '旅行計画',
			language: '言語',
			loading: '旅行計画を生成中...',
			step1: '要件分析',
			step2: 'データ収集',
			step3: '計画生成',
			searchPlace: '場所検索',
			searchPlaceholder: '検索する場所を入力してください',
			searchResults: '検索結果',
			addToPlan: '計画に追加',
			noResults: '検索結果がありません',
			optimizeRoute: 'ルート最適化',
			optimizeRouteTitle: '最適な訪問順序',
			optimizeRouteDesc: '場所を最も効率的な順序で並び替えますか？',
			applyOptimization: '最適化を適用',
			cancel: 'キャンセル',
			copyPlan: '旅行計画をコピー',
			copySuccess: '旅行計画がクリップボードにコピーされました！',
			copyError: 'コピーに失敗しました。',

		},
		zh: {
			logoSubtitle: '全罗北道旅行的开始',
			aiGenerate: 'AI生成',
			freeTravel: '自由旅行',
			aiModalTitle: '您想创建什么样的旅行？',
			aiPlaceholder: '例如）与家人一起的全州旅行，希望体验美食和传统文化',
			generatePlan: '生成计划',
			close: '关闭',
			addSchedule: '请添加行程。',
			travelPlanTitle: '旅行计划',
			language: '语言',
			loading: '正在生成旅行计划...',
			step1: '需求分析',
			step2: '数据收集',
			step3: '计划生成',
			searchPlace: '搜索地点',
			searchPlaceholder: '请输入要搜索的地点',
			searchResults: '搜索结果',
			addToPlan: '添加到计划',
			noResults: '没有找到结果',
			optimizeRoute: '优化路线',
			optimizeRouteTitle: '最佳访问顺序',
			optimizeRouteDesc: '您是否希望以最有效的顺序重新排列地点？',
			applyOptimization: '应用优化',
			cancel: '取消',
			copyPlan: '复制旅行计划',
			copySuccess: '旅行计划已复制到剪贴板！',
			copyError: '复制失败。'
		}
	};
	
	$: t = texts[currentLanguage as keyof typeof texts];

	// 언어 전환 함수
	function switchLanguage(lang: string) {
		currentLanguage = lang;
		showLanguageMenu = false;
	}

	// 언어 메뉴 토글
	function toggleLanguageMenu() {
		showLanguageMenu = !showLanguageMenu;
	}

	// 로딩 메시지 다국어 처리
	function getLoadingMessage() {
		const messages = {
			ko: '잠시만 기다려주세요...',
			en: 'Please wait a moment...',
			ja: '少々お待ちください...',
			zh: '请稍等片刻...'
		};
		return messages[currentLanguage as keyof typeof messages];
	}

	// 단계별 텍스트 다국어 처리
	function getStepText(step: string) {
		const stepTexts = {
			step1: {
				ko: 'AI 분석 중',
				en: 'AI Analyzing',
				ja: 'AI分析中',
				zh: 'AI分析中'
			},
			step2: {
				ko: '데이터 수집 중',
				en: 'Collecting Data',
				ja: 'データ収集中',
				zh: '数据收集中'
			},
			step3: {
				ko: '여행 계획 생성 중',
				en: 'Generating Plan',
				ja: '旅行計画生成中',
				zh: '旅行计划生成中'
			}
		};
		return stepTexts[step as keyof typeof stepTexts][currentLanguage as keyof typeof stepTexts['step1']];
	}

	// 이동 시간 단위 다국어 처리
	function getTimeUnit() {
		const units = {
			ko: '분',
			en: 'min',
			ja: '分',
			zh: '分钟'
		};
		return units[currentLanguage as keyof typeof units];
	}

	// 이동 라벨 다국어 처리
	function getTravelLabel() {
		const labels = {
			ko: '이동',
			en: 'Travel',
			ja: '移動',
			zh: '移动'
		};
		return labels[currentLanguage as keyof typeof labels];
	}

	// 일차별 그룹화 함수
	function groupItemsByDay(items: any[]) {
		const grouped = new Map();
		
		items.forEach(item => {
			const day = item.day || 1;
			if (!grouped.has(day)) {
				grouped.set(day, []);
			}
			grouped.get(day).push(item);
		});
		
		// Map을 배열로 변환하고 일차별로 정렬
		return Array.from(grouped.entries())
			.sort(([a], [b]) => a - b)
			.map(([day, items]) => ({ day, items }));
	}

	// 일차 제목 생성 함수
	function getDayTitle(day: number) {
		const titles = {
			ko: `${day}일차`,
			en: `Day ${day}`,
			ja: `${day}日目`,
			zh: `第${day}天`
		};
		return titles[currentLanguage as keyof typeof titles];
	}

	// 방문 시간을 순서대로 생성하는 함수
	function generateVisitTime(dayIndex: number, itemIndex: number) {
		// 첫 번째 일차는 09:00부터 시작, 두 번째 일차는 08:30부터 시작
		const startHour = dayIndex === 0 ? 9 : 8;
		const startMinute = dayIndex === 0 ? 0 : 30;
		
		// 각 여행지마다 약 2-3시간 간격으로 설정
		const hoursPerActivity = 2.5;
		const totalMinutes = (startHour * 60 + startMinute) + (itemIndex * hoursPerActivity * 60);
		
		const hour = Math.floor(totalMinutes / 60) % 24;
		const minute = Math.floor(totalMinutes % 60);
		
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	}

	const jeonbukCenter: [number, number] = [35.7175, 127.1530];

	// 버튼 클릭 핸들러
	function handleOptionClick(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const theme = button.dataset.theme;
		
		// 버튼 애니메이션 효과
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 150);
		
		// 각 옵션에 따른 모달/사이드바 표시
		switch (theme) {
			case 'ai':
				showAiModal = true;
				break;
			case 'free':
				showSidebar = true;
				break;
		}
	}


	// AI 생성 핸들러
	async function handleAiGenerate() {
		if (!aiInput.trim()) {
			alert('여행에 대한 설명을 입력해주세요.');
			return;
		}

		try {
			// 로딩 상태 표시
			showAiModal = false;
			isLoading = true;

			const response = await fetch('http://localhost:3001/api/travel-plan/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					userInput: aiInput,
					language: currentLanguage
				})
			});

			const result = await response.json();

			if (result.success) {
				// 서버에서 이미 평면화된 데이터를 제공하므로 직접 사용
				travelPlanItems = result.plan || result.data || [];
				
				// 여행 계획 메타데이터 저장 (서버에서 구조화된 planInfo 제공)
				travelPlanInfo = result.planInfo || {
					title: '전라북도 여행 계획',
					summary: aiInput,
					duration: '1-2일'
				};
				
				
				showAiModal = false;
				showTravelPlan = true;
				aiInput = '';
				
				// 지도에 마커 추가
				setTimeout(() => {
					addMapMarkers(travelPlanItems);
				}, 100);
			} else {
				alert('여행 계획 생성에 실패했습니다: ' + result.error);
			}
		} catch (error) {
			alert('여행 계획 생성 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
		} finally {
			// 로딩 상태 해제
			isLoading = false;
		}
	}

	// 모달 닫기 핸들러
	function closeModals() {
		showAiModal = false;
	}

	// 사이드바 닫기 핸들러
	function closeSidebar() {
		showSidebar = false;
	}

	// 사이드바 외부 클릭 핸들러
	function handleSidebarOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeSidebar();
		}
	}

	// 자유 여행에서 검색 모달 열기
	function openSearchFromSidebar() {
		showSidebar = false;
		showSearchModal = true;
	}

	// 여행 계획 초기화 핸들러
	function resetTravelPlan() {
		showTravelPlan = false;
		travelPlanItems = [];
		travelPlanInfo = {};
		clearMapMarkers();
	}

	// 일정 삭제 핸들러
	function deletePlanItem(itemId: string) {
		travelPlanItems = travelPlanItems.filter(item => item.id !== itemId);
		clearMapMarkers();
		if (travelPlanItems.length > 0) {
			addMapMarkers(travelPlanItems);
			// 이동 거리 재계산
			recalculateTravelDistances();
		}
	}

	// 이동 거리 재계산 함수
	async function recalculateTravelDistances() {
		if (travelPlanItems.length < 2) return;
		
		for (let i = 0; i < travelPlanItems.length - 1; i++) {
			const current = travelPlanItems[i];
			const next = travelPlanItems[i + 1];
			
			if (current.coordinates && next.coordinates) {
				try {
					const distance = await calculateDistance(
						current.coordinates[0], current.coordinates[1],
						next.coordinates[0], next.coordinates[1]
					);
					travelPlanItems[i].travelTime = Math.round(distance / 60); // 분 단위로 변환
				} catch (error) {
					console.error('거리 계산 오류:', error);
					travelPlanItems[i].travelTime = 0;
				}
			}
		}
		
		// 마지막 항목의 이동 시간은 0으로 설정
		if (travelPlanItems.length > 0) {
			travelPlanItems[travelPlanItems.length - 1].travelTime = 0;
		}
	}

	// 두 좌표 간의 거리 계산 (Haversine 공식)
	async function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
		const R = 6371; // 지구 반지름 (km)
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c; // km 단위
	}

	// 여행지 검색 함수
	async function searchPlaces(query: string) {
		if (!query.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		try {
			console.log(`장소 검색 시작: "${query}"`);
			
			const response = await fetch(`http://localhost:3001/api/travel-plan/search?query=${encodeURIComponent(query)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();

			if (result.success) {
				searchResults = result.data || [];
				console.log(`검색 결과: ${searchResults.length}개`);
			} else {
				console.error('검색 실패:', result.error);
				searchResults = [];
				
				// API 오류 시 샘플 데이터로 폴백
				const samplePlaces = [
					{
						id: 'sample_place1',
						title: '전주 한옥마을',
						location: '전주시 완산구 기린대로 99',
						coordinates: [35.8154, 127.1534],
						description: '전통 한옥이 잘 보존된 마을',
						type: '관광지'
					},
					{
						id: 'sample_place2',
						title: '전주 비빔밥 맛집',
						location: '전주시 완산구 한지길 89',
						coordinates: [35.8167, 127.1544],
						description: '전주 비빔밥의 진수를 맛볼 수 있는 곳',
						type: '맛집'
					},
					{
						id: 'sample_place3',
						title: '덕진공원',
						location: '전주시 덕진구 덕진동',
						coordinates: [35.8294, 127.1331],
						description: '아름다운 연못과 정원이 있는 공원',
						type: '공원'
					}
				];

				// 검색어와 매칭되는 장소 필터링
				searchResults = samplePlaces.filter(place => 
					place.title.toLowerCase().includes(query.toLowerCase()) ||
					place.description.toLowerCase().includes(query.toLowerCase()) ||
					place.type.toLowerCase().includes(query.toLowerCase())
				);
			}
		} catch (error) {
			console.error('검색 오류:', error);
			searchResults = [];
			
			// 네트워크 오류 시 샘플 데이터로 폴백
			const samplePlaces = [
				{
					id: 'sample_place1',
					title: '전주 한옥마을',
					location: '전주시 완산구 기린대로 99',
					coordinates: [35.8154, 127.1534],
					description: '전통 한옥이 잘 보존된 마을',
					type: '관광지'
				}
			];

			searchResults = samplePlaces.filter(place => 
				place.title.toLowerCase().includes(query.toLowerCase()) ||
				place.description.toLowerCase().includes(query.toLowerCase()) ||
				place.type.toLowerCase().includes(query.toLowerCase())
			);
		} finally {
			isSearching = false;
		}
	}



	// 여행지 추가 함수
	async function addPlaceToPlan(place: any) {
		try {
			console.log(`여행 계획에 장소 추가: ${place.title}`);
			
			const response = await fetch('http://localhost:3001/api/travel-plan/add-place', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					place: place,
					planItems: travelPlanItems
				})
			});

			const result = await response.json();

			if (result.success) {
				const newItem = result.data;
				travelPlanItems = [...travelPlanItems, newItem];
				clearMapMarkers();
				addMapMarkers(travelPlanItems);
				recalculateTravelDistances();
				showSearchModal = false;
				searchQuery = '';
				searchResults = [];
				console.log('장소 추가 완료');
			} else {
				console.error('장소 추가 실패:', result.error);
				alert('장소 추가에 실패했습니다: ' + result.error);
			}
		} catch (error) {
			console.error('장소 추가 오류:', error);
			
			// API 오류 시 클라이언트에서 직접 추가
			const newItem = {
				id: `item_${Date.now()}`,
				title: place.title,
				location: place.location,
				coordinates: place.coordinates,
				description: place.description,
				type: place.type,
				time: `${travelPlanItems.length + 1}번째`,
				travelTime: 0
			};

			travelPlanItems = [...travelPlanItems, newItem];
			clearMapMarkers();
			addMapMarkers(travelPlanItems);
			recalculateTravelDistances();
			showSearchModal = false;
			searchQuery = '';
			searchResults = [];
		}
	}

	// 최적 경로 계산 (TSP 알고리즘 - 간단한 근사치)
	function calculateOptimalRoute() {
		if (travelPlanItems.length < 3) return;

		const places = travelPlanItems.map(item => ({
			...item,
			coordinates: item.coordinates
		}));

		// 시작점을 첫 번째 장소로 설정
		const startPoint = places[0];
		const remaining = places.slice(1);
		const optimized = [startPoint];

		let current = startPoint;
		while (remaining.length > 0) {
			let nearestIndex = 0;
			let nearestDistance = Infinity;

			// 가장 가까운 다음 장소 찾기
			for (let i = 0; i < remaining.length; i++) {
				const distance = calculateDistanceSync(
					current.coordinates[0], current.coordinates[1],
					remaining[i].coordinates[0], remaining[i].coordinates[1]
				);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestIndex = i;
				}
			}

			current = remaining[nearestIndex];
			optimized.push(current);
			remaining.splice(nearestIndex, 1);
		}

		// 순서 업데이트
		travelPlanItems = optimized.map((item, index) => ({
			...item,
			time: `${index + 1}번째`,
			travelTime: 0
		}));

		clearMapMarkers();
		addMapMarkers(travelPlanItems);
		recalculateTravelDistances();
	}

	// 동기 거리 계산 (TSP용)
	function calculateDistanceSync(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371;
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	}

	// 검색 모달 열기/닫기
	function toggleSearchModal() {
		showSearchModal = !showSearchModal;
		if (!showSearchModal) {
			searchQuery = '';
			searchResults = [];
		}
	}

	// 클립보드 복사 함수
	async function copyTravelPlanToClipboard() {
		try {
			// 여행 계획을 텍스트로 포맷팅
			let planText = `📋 ${travelPlanInfo.title || '여행 계획'}\n\n`;
			
			if (travelPlanInfo.summary) {
				planText += `📝 요약: ${travelPlanInfo.summary}\n`;
			}
			if (travelPlanInfo.duration) {
				planText += `📅 기간: ${travelPlanInfo.duration}\n`;
			}
			
			planText += `\n🗺️ 여행 일정:\n`;
			planText += '='.repeat(30) + '\n\n';
			
			travelPlanItems.forEach((item, index) => {
				planText += `${index + 1}. ${item.title || item.location || `활동 ${index + 1}`}\n`;
				if (item.type) {
					planText += `   유형: ${item.type}\n`;
				}
				if (item.travelTime > 0) {
					planText += `   이동시간: ${item.travelTime}분\n`;
				}
				planText += `   시간: ${item.time || `${index + 1}번째`}\n\n`;
			});
			
			planText += `\n✨ Ondam - 전라북도 여행 계획 서비스`;
			
			// 클립보드에 복사
			await navigator.clipboard.writeText(planText);
			
			// 성공 메시지 표시
			showCopySuccess = true;
			setTimeout(() => {
				showCopySuccess = false;
			}, 3000);
			
		} catch (error) {
			console.error('클립보드 복사 오류:', error);
			alert(t.copyError);
		}
	}

	// 지도 마커 관련 함수들
	function clearMapMarkers() {
		if (map && mapMarkers.length > 0) {
			mapMarkers.forEach(marker => {
				map.removeLayer(marker);
			});
			mapMarkers = [];
			highlightedMarker = null;
		}
		
		// 경로 라인들 제거
		if (map && routeLines.length > 0) {
			routeLines.forEach(line => {
				map.removeLayer(line);
			});
			routeLines = [];
		}
		
		// 화살표 마커들 제거
		if (map && arrowMarkers.length > 0) {
			arrowMarkers.forEach(arrow => {
				map.removeLayer(arrow);
			});
			arrowMarkers = [];
		}
	}

	// 두 지점 사이에 점선과 화살표를 그리는 함수
	function drawRouteWithArrow(startCoords: [number, number], endCoords: [number, number], index: number, travelTime?: number) {
		if (!map || !L) return;

		// 점선 그리기
		const polyline = L.polyline([startCoords, endCoords], {
			color: '#667eea',
			weight: 3,
			opacity: 0.8,
			dashArray: '10, 10'
		}).addTo(map);
		
		routeLines.push(polyline);

		// 화살표 위치 계산 (선분의 중점에서 약간 끝점 쪽으로)
		const midLat = (startCoords[0] + endCoords[0]) / 2;
		const midLng = (startCoords[1] + endCoords[1]) / 2;
		
		// 방향 계산 (지도 좌표계에 맞게 수정, 180도 추가)
		const deltaLat = endCoords[0] - startCoords[0];
		const deltaLng = endCoords[1] - startCoords[1];
		const angle = Math.atan2(deltaLng, deltaLat) * 180 / Math.PI + 90 + 180;

		// 화살표 마커 생성
		const arrowIcon = L.divIcon({
			className: 'route-arrow',
			html: `<div class="arrow-icon" style="transform: rotate(${angle}deg);">➤</div>`,
			iconSize: [20, 20],
			iconAnchor: [10, 10]
		});

		const arrowMarker = L.marker([midLat, midLng], {
			icon: arrowIcon,
			interactive: false
		}).addTo(map);
		
		arrowMarkers.push(arrowMarker);

		// 이동 시간 표시 (화살표 옆에)
		if (travelTime && travelTime > 0) {
			const timeIcon = L.divIcon({
				className: 'travel-time-marker',
				html: `<div class="travel-time-label">${travelTime}분</div>`,
				iconSize: [60, 25],
				iconAnchor: [30, 12]
			});

			// 이동 시간 라벨을 화살표 근처에 배치 (약간 오프셋)
			const timeLat = midLat + (deltaLat * 0.1);
			const timeLng = midLng + (deltaLng * 0.1);

			const timeMarker = L.marker([timeLat, timeLng], {
				icon: timeIcon,
				interactive: false
			}).addTo(map);
			
			arrowMarkers.push(timeMarker);
		}
	}

	// 모든 경로 라인과 화살표를 그리는 함수
	function drawAllRoutes(plan: any[]) {
		if (!map || !L || plan.length < 2) return;

		for (let i = 0; i < plan.length - 1; i++) {
			const current = plan[i];
			const next = plan[i + 1];
			
			if (current.coordinates && next.coordinates && 
				Array.isArray(current.coordinates) && Array.isArray(next.coordinates) &&
				current.coordinates.length === 2 && next.coordinates.length === 2) {
				
				// 다음 여행지의 이동 시간을 사용 (현재 위치에서 다음 위치까지의 시간)
				const travelTime = next.travelTime || 0;
				
				drawRouteWithArrow(
					[current.coordinates[0], current.coordinates[1]],
					[next.coordinates[0], next.coordinates[1]],
					i,
					travelTime
				);
			}
		}
	}

	// 여행지 관련 링크 생성 함수
	function generateRelatedLinks(item: any) {
		const placeName = encodeURIComponent(item.title || item.location);
		const location = encodeURIComponent(item.location || '');
		
		const links = [
			{
				name: '네이버 지도',
				url: `https://map.naver.com/v5/search/${placeName}`
			},
			{
				name: '구글 지도',
				url: `https://www.google.com/maps/search/${placeName}+${location}`
			},
			{
				name: '네이버 검색',
				url: `https://search.naver.com/search.naver?query=${placeName}+여행+정보`
			},
			{
				name: '블로그 후기',
				url: `https://search.naver.com/search.naver?where=post&query=${placeName}+후기+여행`
			}
		];
		
		return links.map(link => 
			`<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="popup-link">${link.name}</a>`
		).join(' | ');
	}

	function addMapMarkers(plan: any[]) {
		if (!map || !L) return;
		
		clearMapMarkers();
		
		plan.forEach((item, index) => {
			if (item.coordinates && Array.isArray(item.coordinates) && item.coordinates.length === 2) {
				const [lat, lng] = item.coordinates;
				const marker = L.marker([lat, lng], {
					icon: L.divIcon({
						className: 'custom-marker',
						html: `<div class="marker-content">
							<div class="marker-number">${index + 1}</div>
							<div class="marker-title">${item.title || item.location}</div>
						</div>`,
						iconSize: [80, 40],
						iconAnchor: [40, 20]
					})
				}).addTo(map);
				
				marker.planItemId = item.id;
				mapMarkers.push(marker);
				
				// 관련 링크 생성
				const relatedLinks = generateRelatedLinks(item);
				
				// 마커 클릭 시 팝업 표시 (관련 링크 포함)
				marker.bindPopup(`
					<div class="marker-popup">
						<h4>${item.title || item.location}</h4>
						<p><strong>시간:</strong> ${item.time}</p>
						<p><strong>유형:</strong> ${item.type}</p>
						${item.description ? `<p><strong>설명:</strong> ${item.description}</p>` : ''}
						<div class="popup-links">
							<p><strong>관련 링크:</strong></p>
							<div class="links-container">
								${relatedLinks}
							</div>
						</div>
					</div>
				`);
			}
		});
		
		// 경로 라인과 화살표 그리기
		drawAllRoutes(plan);
		
		// 모든 마커가 보이도록 지도 범위 조정
		if (mapMarkers.length > 0) {
			const group = new L.featureGroup(mapMarkers);
			map.fitBounds(group.getBounds().pad(0.1));
		}
	}

	function highlightMarker(planItemId: string) {
		if (!map || !L) return;
		
		// 기존 강조 제거
		if (highlightedMarker) {
			highlightedMarker.getElement().classList.remove('highlighted');
		}
		
		// 새로운 마커 강조
		const marker = mapMarkers.find(m => m.planItemId === planItemId);
		if (marker) {
			marker.getElement().classList.add('highlighted');
			highlightedMarker = marker;
			
			// 마커가 보이도록 지도 중심 이동
			map.setView(marker.getLatLng(), Math.max(map.getZoom(), 12));
		}
	}

	function removeHighlight() {
		if (highlightedMarker) {
			highlightedMarker.getElement().classList.remove('highlighted');
			highlightedMarker = null;
		}
	}

	onMount(async () => {
		if (!browser) return;
		
		try {
			L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');

			map = L.map(mapContainer, {
				zoomControl: false
			}).setView(jeonbukCenter, 9);

			// 컬러 배경 타일 (전체 지역)
			const colorLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				className: 'color-tiles'
			}).addTo(map);

			// GeoJSON 데이터 로딩 시도 (실패 시 기본 지도 표시)
			let jeonbukLayer = null;
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
				
				const response = await fetch('https://raw.githubusercontent.com/southkorea-maps/southkorea-maps.github.io/master/geojson/TL_SCCO_CTPRVN.json', {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
					},
					mode: 'cors',
					signal: controller.signal
				});
				
				clearTimeout(timeoutId);
				
				if (response.ok) {
					const data = await response.json();
					const jeonbuk = data.features.find((f: any) => f.properties.CTPRVN_NM === '전라북도');
					
					if (jeonbuk) {
						jeonbukLayer = L.geoJSON(jeonbuk, {
							style: {
								fillColor: '#667eea',
								fillOpacity: 0.1,
								color: '#667eea',
								weight: 3,
								opacity: 0.9,
								dashArray: '10, 5'
							}
						}).addTo(map);
					}
				}
			} catch (error) {
				// GeoJSON 로드 실패 시 조용히 넘어감 (에러 로그 없음)
			}

			// 지도 범위 설정
			if (jeonbukLayer) {
				// GeoJSON이 로드된 경우 해당 범위로 설정
				map.fitBounds(jeonbukLayer.getBounds());
			} else {
				// GeoJSON이 로드되지 않은 경우 기본 범위로 설정
				map.setView(jeonbukCenter, 9);
			}

			// 지도 크기 조정
			setTimeout(() => {
				map.invalidateSize();
				isLoading = false;
			}, 100);
		} catch (error) {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Ondam - 전라북도 여행 계획</title>
	<meta name="description" content="전라북도의 아름다운 여행지를 발견하고 계획을 세워보세요" />
</svelte:head>

<div class="map-container">
	<div bind:this={mapContainer} class="map"></div>
	
	<!-- Ondam 로고 -->
	<div class="logo">
		<div class="logo-container">
			<h1>Ondam</h1>
			<div class="logo-subtitle">{t.logoSubtitle}</div>
		</div>
	</div>
	
	<!-- 언어 설정 -->
	<div class="language-switcher">
		<button class="language-btn" on:click={toggleLanguageMenu}>
			<span class="language-icon">🌐</span>
			<span class="language-text">{currentLanguage.toUpperCase()}</span>
		</button>
		
		{#if showLanguageMenu}
			<div class="language-menu">
				<button class="language-option" class:active={currentLanguage === 'ko'} on:click={() => switchLanguage('ko')}>
					🇰🇷 한국어
				</button>
				<button class="language-option" class:active={currentLanguage === 'en'} on:click={() => switchLanguage('en')}>
					🇺🇸 English
				</button>
				<button class="language-option" class:active={currentLanguage === 'ja'} on:click={() => switchLanguage('ja')}>
					🇯🇵 日本語
				</button>
				<button class="language-option" class:active={currentLanguage === 'zh'} on:click={() => switchLanguage('zh')}>
					🇨🇳 中文
				</button>
			</div>
		{/if}
	</div>
	
	<!-- 여행 옵션 버튼들 -->
	<div class="travel-options" class:hidden={showSidebar || showTravelPlan}>
		<button class="option-btn" data-theme="ai" on:click={handleOptionClick}>
			<span class="btn-icon">🤖</span>
			<span class="btn-text">{t.aiGenerate}</span>
		</button>
		<button class="option-btn" data-theme="free" on:click={handleOptionClick}>
			<span class="btn-icon">✈️</span>
			<span class="btn-text">{t.freeTravel}</span>
		</button>
	</div>
	

	<!-- AI 생성 모달 -->
	{#if showAiModal}
		<div class="modal-overlay" role="button" tabindex="0" on:click={closeModals} on:keydown={(e) => e.key === 'Escape' && closeModals()}>
			<div class="modal" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown={(e) => e.key === 'Escape' && closeModals()}>
				<div class="modal-header">
					<h2>{t.aiModalTitle}</h2>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				<div class="modal-content">
					<textarea
						bind:value={aiInput}
						placeholder={t.aiPlaceholder}
						class="ai-textarea"
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleAiGenerate();
							}
						}}
					></textarea>
					<div class="modal-actions">
						<button class="action-btn primary" on:click={handleAiGenerate}>{t.generatePlan}</button>
						<button class="action-btn secondary" on:click={closeModals}>{t.close}</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 자유 여행 사이드바 -->
	{#if showSidebar}
		<div class="sidebar-overlay" role="button" tabindex="0" on:click={handleSidebarOverlayClick} on:keydown={(e) => e.key === 'Escape' && closeSidebar()}>
			<div class="sidebar">
				<div class="sidebar-header">
					<h2>자유 여행</h2>
					<button class="close-btn" on:click={closeSidebar}>×</button>
				</div>
				<div class="sidebar-content">
					<div class="sidebar-actions">
						<button class="action-button search-action" on:click={openSearchFromSidebar}>
							<span class="action-icon">🔍</span>
							<span class="action-text">장소 검색하기</span>
						</button>
						<button class="action-button add-action" on:click={openSearchFromSidebar}>
							<span class="action-icon">📍</span>
							<span class="action-text">직접 장소 추가</span>
						</button>
					</div>
					<p class="sidebar-message">검색을 통해 원하는 장소를 찾아 여행 계획에 추가해보세요.</p>
					
					{#if travelPlanItems.length > 0}
						<div class="current-plan">
							<h3>현재 여행 계획</h3>
							<div class="plan-preview">
								{#each travelPlanItems.slice(0, 3) as item, index}
									<div class="preview-item">
										<span class="preview-number">{index + 1}</span>
										<span class="preview-title">{item.title}</span>
									</div>
								{/each}
								{#if travelPlanItems.length > 3}
									<div class="preview-more">+{travelPlanItems.length - 3}개 더</div>
								{/if}
							</div>
							<button class="view-full-plan-btn" on:click={() => { showSidebar = false; showTravelPlan = true; }}>
								전체 계획 보기
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- 여행 계획 표시 -->
	{#if showTravelPlan}
		<div class="travel-plan-container">
			<div class="travel-plan-header">
				<div class="plan-title-section">
					<h2>{travelPlanInfo.title || '여행 계획'}</h2>
					{#if travelPlanInfo.summary}
						<p class="plan-summary">{travelPlanInfo.summary}</p>
					{/if}
					<div class="plan-meta">
						{#if travelPlanInfo.duration}
							<span class="meta-item">📅 {travelPlanInfo.duration}</span>
						{/if}
					</div>
				</div>
				<div class="plan-actions">
					<button class="search-btn primary-action" on:click={toggleSearchModal} title={t.searchPlace}>
						<span class="search-icon">🔍</span>
						<span class="search-text">여행지 추가</span>
					</button>
					<button class="copy-btn" on:click={copyTravelPlanToClipboard} title={t.copyPlan}>
						<span class="copy-icon">📋</span>
					</button>
					{#if travelPlanItems.length > 2}
						<button class="optimize-btn" on:click={calculateOptimalRoute} title={t.optimizeRoute}>
							<span class="optimize-icon">⚡</span>
						</button>
					{/if}
					<button class="close-plan-btn" on:click={resetTravelPlan}>×</button>
				</div>
			</div>
			<div class="travel-plan-content">
				{#if travelPlanItems.length > 0}
					{@const groupedItems = groupItemsByDay(travelPlanItems)}
					{#each groupedItems as dayGroup, dayIndex}
						<!-- 일차별 헤더 -->
						<div class="day-header">
							<div class="day-title">
								<span class="day-number">{getDayTitle(dayGroup.day)}</span>
								<div class="day-line"></div>
							</div>
						</div>
						
						<!-- 해당 일차의 여행지들 -->
						{#each dayGroup.items as item, itemIndex}
							{@const globalIndex = travelPlanItems.findIndex(planItem => planItem.id === item.id)}
							<div 
								class="plan-item" 
								role="button"
								tabindex="0"
								on:mouseenter={() => highlightMarker(item.id)}
								on:mouseleave={removeHighlight}
								on:keydown={(e) => e.key === 'Enter' && highlightMarker(item.id)}
							>
								<button class="delete-btn" on:click={() => deletePlanItem(item.id)} title="일정 삭제">
									<span class="delete-icon">×</span>
								</button>
								<div class="plan-time">
									<span class="time-badge">{generateVisitTime(dayIndex, itemIndex)}</span>
								</div>
								<div class="plan-details">
									<h3 class="plan-title">{item.title || item.location || `활동 ${itemIndex + 1}`}</h3>
									{#if item.type}
										<span class="plan-type">{item.type}</span>
									{/if}
								</div>
							</div>
							
							<!-- 다음 여행지로의 이동 시간 표시 (같은 일차 내에서 마지막 항목이 아닌 경우) -->
							{#if itemIndex < dayGroup.items.length - 1}
								{@const nextItem = dayGroup.items[itemIndex + 1]}
								{#if nextItem.travelTime && nextItem.travelTime > 0}
									<div class="travel-time-separator">
										<div class="travel-line"></div>
										<div class="travel-time-info">
											<div class="travel-icon">🚗</div>
											<span class="travel-duration">{nextItem.travelTime}{getTimeUnit()}</span>
											<span class="travel-label">{getTravelLabel()}</span>
										</div>
										<div class="travel-line"></div>
									</div>
								{/if}
							{/if}
						{/each}
						
						<!-- 일차 간 구분선 (마지막 일차가 아닌 경우) -->
						{#if dayIndex < groupedItems.length - 1}
							<div class="day-separator">
								<div class="day-separator-line"></div>
							</div>
						{/if}
					{/each}
				{:else}
					<div class="no-plan">
						<p>생성된 여행 계획이 없습니다.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	
	{#if isLoading}
		<div class="loading-overlay">
			<div class="loading-container">
				<div class="loading-spinner">
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
				</div>
				<div class="loading-text">
					<h3>{t.loading}</h3>
					<p>{getLoadingMessage()}</p>
				</div>
				<div class="loading-steps">
					<div class="step active">
						<span class="step-icon">🤖</span>
						<span class="step-text">{getStepText('step1')}</span>
					</div>
					<div class="step">
						<span class="step-icon">📊</span>
						<span class="step-text">{getStepText('step2')}</span>
					</div>
					<div class="step">
						<span class="step-icon">🗺️</span>
						<span class="step-text">{getStepText('step3')}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- 검색 모달 -->
	{#if showSearchModal}
		<div class="modal-overlay" role="button" tabindex="0" on:click={toggleSearchModal} on:keydown={(e) => e.key === 'Escape' && toggleSearchModal()}>
			<div class="modal search-modal" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown={(e) => e.key === 'Escape' && toggleSearchModal()}>
				<div class="modal-header">
					<h2>{t.searchPlace}</h2>
					<button class="close-btn" on:click={toggleSearchModal}>×</button>
				</div>
				<div class="modal-content">
					<!-- 검색 -->
					<div class="search-input-container">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder={t.searchPlaceholder}
							class="search-input"
							on:input={() => searchPlaces(searchQuery)}
						/>
						{#if isSearching}
							<div class="search-loading">검색 중...</div>
						{/if}
					</div>
					
					<!-- 검색 결과 -->
					{#if searchResults.length > 0}
						<div class="search-results">
							<h3>{t.searchResults}</h3>
							<div class="results-list">
								{#each searchResults as place}
									<div class="result-item" role="button" tabindex="0" on:click={() => addPlaceToPlan(place)} on:keydown={(e) => e.key === 'Enter' && addPlaceToPlan(place)}>
										<div class="result-info">
											<h4 class="result-title">{place.title}</h4>
											<p class="result-location">{place.location}</p>
											<div class="result-meta">
												<span class="result-type">{place.type}</span>
												{#if place.rating}
													<span class="result-rating">
														⭐ {place.rating.toFixed(1)}
													</span>
												{/if}
												{#if place.price_level}
													<span class="result-price">
														{'$'.repeat(place.price_level)}
													</span>
												{/if}
											</div>
											{#if place.description}
												<p class="result-description">{place.description}</p>
											{/if}
										</div>
										<button class="add-btn" on:click={() => addPlaceToPlan(place)}>
											{t.addToPlan}
										</button>
									</div>
								{/each}
							</div>
						</div>
					{:else if searchQuery && !isSearching}
						<div class="no-results">
							<p>{t.noResults}</p>
						</div>
					{/if}
					
					{#if !searchQuery}
						<div class="search-help">
							<div class="help-icon">🔍</div>
							<h3>여행지를 검색해보세요</h3>
							<p>전라북도의 관광지, 맛집, 숙박시설 등을 검색하여<br>여행 계획에 추가할 수 있습니다.</p>
							<div class="search-examples">
								<span class="example-tag" on:click={() => { searchQuery = '전주 한옥마을'; searchPlaces('전주 한옥마을'); }}>전주 한옥마을</span>
								<span class="example-tag" on:click={() => { searchQuery = '비빔밥'; searchPlaces('비빔밥'); }}>비빔밥</span>
								<span class="example-tag" on:click={() => { searchQuery = '덕진공원'; searchPlaces('덕진공원'); }}>덕진공원</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- 복사 성공 메시지 -->
	{#if showCopySuccess}
		<div class="copy-success-toast">
			<div class="toast-content">
				<span class="toast-icon">✅</span>
				<span class="toast-text">{t.copySuccess}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Pretendard', 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		overflow: hidden;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(html) {
		height: 100%;
	}

	:global(#app) {
		height: 100vh;
	}

	.map-container {
		width: 100vw;
		height: 100vh;
		position: relative;
		overflow: hidden;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	/* 로딩 오버레이 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3000;
		animation: fadeIn 0.3s ease;
	}

	.loading-container {
		background: white;
		border-radius: 24px;
		padding: 3rem 2rem;
		text-align: center;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		max-width: 400px;
		width: 90%;
	}

	.loading-spinner {
		position: relative;
		width: 80px;
		height: 80px;
		margin: 0 auto 2rem;
	}

	.spinner-ring {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 3px solid transparent;
		border-top: 3px solid #4f46e5;
		border-radius: 50%;
		animation: spin 1.5s linear infinite;
	}

	.spinner-ring:nth-child(2) {
		width: 60px;
		height: 60px;
		top: 10px;
		left: 10px;
		border-top-color: #667eea;
		animation-duration: 2s;
		animation-direction: reverse;
	}

	.spinner-ring:nth-child(3) {
		width: 40px;
		height: 40px;
		top: 20px;
		left: 20px;
		border-top-color: #8b5cf6;
		animation-duration: 1s;
	}

	.loading-text h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
	}

	.loading-text p {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
	}

	.loading-steps {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		opacity: 0.5;
		transition: all 0.3s ease;
	}

	.step.active {
		opacity: 1;
	}

	.step-icon {
		font-size: 1.5rem;
		display: block;
	}

	.step-text {
		font-size: 0.8rem;
		font-weight: 600;
		color: #4b5563;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* 컬러 타일을 위한 CSS */
	:global(.color-tiles) {
		filter: blur(0.5px) brightness(1.1);
	}

	/* 전라북도 강조 타일을 위한 CSS */
	:global(.highlight-tiles) {
		filter: blur(0.3px) brightness(1.2) saturate(1.1);
	}

	/* Ondam 로고 */
	.logo {
		position: absolute;
		top: 2.5rem;
		left: 3rem;
		z-index: 1000;
	}

	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}


	.logo h1 {
		font-size: 3.5rem;
		font-weight: 900;
		color: #1f2937;
		margin: 0;
		letter-spacing: -0.03em;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		background: linear-gradient(135deg, #1f2937 0%, #4f46e5 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.logo-subtitle {
		font-size: 1rem;
		font-weight: 600;
		color: #6b7280;
		margin: 0;
		letter-spacing: 0.02em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	/* 여행 옵션 버튼들 */
	.travel-options {
		position: absolute;
		bottom: 3rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1.5rem;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		padding: 1rem 2rem;
		border-radius: 50px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.option-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		min-width: 140px;
		position: relative;
		overflow: hidden;
	}

	.option-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.option-btn:hover {
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		background: rgba(255, 255, 255, 1);
		border-color: rgba(79, 70, 229, 0.3);
	}

	.option-btn:hover::before {
		opacity: 1;
	}

	.option-btn:active {
		transform: translateY(-6px) scale(0.98);
	}

	.btn-icon {
		font-size: 3rem;
		line-height: 1;
		position: relative;
		z-index: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		transition: transform 0.3s ease;
	}

	.option-btn:hover .btn-icon {
		transform: scale(1.1);
	}

	.btn-text {
		font-size: 1.2rem;
		font-weight: 800;
		color: #1f2937;
		line-height: 1;
		position: relative;
		z-index: 1;
		letter-spacing: -0.01em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	/* 반응형 디자인 */
	@media (max-width: 768px) {
		.logo {
			top: 1.5rem;
			left: 2rem;
		}

		.logo h1 {
			font-size: 2.8rem;
		}

		.logo-subtitle {
			font-size: 0.9rem;
		}

		.travel-options {
			bottom: 2.5rem;
			flex-direction: column;
			gap: 1rem;
		}

		.option-btn {
			padding: 1.5rem 2rem;
			min-width: 140px;
			flex-direction: row;
			gap: 1rem;
		}

		.btn-icon {
			font-size: 2rem;
		}

		.btn-text {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.logo {
			top: 1rem;
			left: 1.5rem;
		}

		.logo h1 {
			font-size: 2.2rem;
		}

		.logo-subtitle {
			font-size: 0.8rem;
		}

		.travel-options {
			left: 1rem;
			right: 1rem;
			transform: none;
			flex-direction: row;
			justify-content: space-between;
			bottom: 2rem;
		}

		.option-btn {
			flex: 1;
			padding: 1rem 0.8rem;
			min-width: auto;
			flex-direction: column;
			gap: 0.5rem;
		}

		.btn-icon {
			font-size: 1.5rem;
		}

		.btn-text {
			font-size: 0.85rem;
		}
	}

	/* 숨김 클래스 */
	.hidden {
		display: none !important;
	}

	/* 모달 스타일 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fadeIn 0.3s ease;
	}

	.modal {
		background: white;
		border-radius: 24px;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow: hidden;
		animation: slideUp 0.3s ease;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 2rem 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		transition: all 0.2s ease;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.modal-content {
		padding: 2rem;
	}


	/* AI 모달 스타일 */
	.ai-textarea {
		width: 100%;
		min-height: 80px;
		max-height: 200px;
		padding: 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
		background: white;
		line-height: 1.5;
	}

	.ai-textarea:focus {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	.ai-textarea::placeholder {
		color: #9ca3af;
		opacity: 1;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		justify-content: flex-end;
	}

	.action-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.action-btn.primary {
		background: #4f46e5;
		color: white;
	}

	.action-btn.primary:hover {
		background: #4338ca;
		transform: translateY(-1px);
	}

	.action-btn.secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.action-btn.secondary:hover {
		background: #e5e7eb;
	}

	/* 사이드바 스타일 */
	.sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(2px);
		z-index: 2000;
		animation: fadeIn 0.3s ease;
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 350px;
		height: 100vh;
		background: white;
		box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		animation: slideInLeft 0.3s ease;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.add-btn {
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-btn:hover {
		background: #4338ca;
		transform: scale(1.05);
	}

	.sidebar-content {
		flex: 1;
		padding: 2rem 1.5rem;
	}

	.sidebar-message {
		color: #6b7280;
		font-size: 1rem;
		text-align: center;
		margin-top: 1.5rem;
		line-height: 1.5;
	}

	.sidebar-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		width: 100%;
	}

	.action-button:hover {
		border-color: #4f46e5;
		background: #f8fafc;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
	}

	.action-icon {
		font-size: 1.5rem;
		width: 2rem;
		text-align: center;
	}

	.action-text {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.current-plan {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.current-plan h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.plan-preview {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.preview-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.preview-item:last-child {
		border-bottom: none;
	}

	.preview-number {
		background: #4f46e5;
		color: white;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.preview-title {
		font-size: 0.9rem;
		color: #374151;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.preview-more {
		font-size: 0.85rem;
		color: #6b7280;
		text-align: center;
		padding: 0.5rem 0;
		font-style: italic;
	}

	.view-full-plan-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-full-plan-btn:hover {
		background: #4338ca;
		transform: translateY(-1px);
	}

	/* 애니메이션 */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInLeft {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes slideInFromLeft {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInFromBottom {
		from {
			opacity: 0;
			transform: translateY(50px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 언어 설정 */
	.language-switcher {
		position: absolute;
		top: 2.5rem;
		right: 3rem;
		z-index: 1000;
	}

	.language-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.language-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		background: rgba(255, 255, 255, 1);
	}

	.language-icon {
		font-size: 1.2rem;
	}

	.language-text {
		font-size: 0.9rem;
		font-weight: 700;
		color: #1f2937;
	}

	.language-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: slideUp 0.2s ease;
		min-width: 140px;
	}

	.language-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-size: 0.9rem;
		font-weight: 600;
		color: #1f2937;
	}

	.language-option:hover {
		background: #f3f4f6;
	}

	.language-option.active {
		background: #e0e7ff;
		color: #4f46e5;
	}

	/* 초기 로드 애니메이션 */
	.logo {
		animation: slideInFromLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.language-switcher {
		animation: slideInFromLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
	}

	.travel-options {
		animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
	}

	.option-btn {
		animation: slideInFromBottom 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	.option-btn:nth-child(1) { animation-delay: 0.1s; }
	.option-btn:nth-child(2) { animation-delay: 0.2s; }

	/* 여행 계획 표시 스타일 */
	.travel-plan-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 400px;
		height: 100vh;
		background: white;
		box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
		z-index: 1500;
		display: flex;
		flex-direction: column;
		animation: slideInLeft 0.3s ease;
		overflow: hidden;
	}

	.travel-plan-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		min-height: 80px; /* 최소 높이 설정 */
		flex-wrap: wrap; /* 작은 화면에서 줄바꿈 허용 */
	}

	/* 작은 화면에서 헤더 레이아웃 조정 */
	@media (max-width: 480px) {
		.travel-plan-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		
		.plan-actions {
			margin-left: 0;
			justify-content: flex-end;
		}
		
		.travel-plan-header h2 {
			white-space: normal; /* 작은 화면에서는 줄바꿈 허용 */
			font-size: 1.3rem;
		}
	}

	.plan-title-section {
		flex: 1;
		min-width: 200px; /* 제목이 최소 너비를 가지도록 */
		overflow: hidden; /* 넘치는 내용 숨김 */
	}

	.plan-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0; /* 아이콘들이 줄어들지 않도록 */
		margin-left: 1rem; /* 제목과 버튼 사이 여백 */
	}

	.travel-plan-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
		line-height: 1.3;
		white-space: nowrap; /* 제목이 한 줄로 표시되도록 */
		overflow: hidden;
		text-overflow: ellipsis; /* 긴 제목은 ... 으로 표시 */
	}

	.plan-summary {
		font-size: 0.9rem;
		color: #6b7280;
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
	}

	.plan-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.meta-item {
		font-size: 0.8rem;
		color: #4b5563;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
	}

	.search-btn, .copy-btn, .optimize-btn, .close-plan-btn {
		background: white;
		border: 1px solid #e5e7eb;
		font-size: 1.1rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.search-btn:hover, .copy-btn:hover, .optimize-btn:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.close-plan-btn {
		background: #fee2e2;
		border-color: #fecaca;
		color: #dc2626;
	}

	.close-plan-btn:hover {
		background: #fecaca;
		border-color: #fca5a5;
	}

	.search-btn.primary-action {
		background: #4f46e5;
		color: white;
		border-radius: 12px;
		width: auto;
		height: auto;
		padding: 0.75rem 1rem;
		gap: 0.5rem;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
	}

	.search-btn.primary-action:hover {
		background: #4338ca;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
	}

	.search-btn:hover, .copy-btn:hover, .optimize-btn:hover, .close-plan-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.search-text {
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.search-icon, .copy-icon, .optimize-icon {
		font-size: 1rem;
	}

	.travel-plan-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0;
	}

	.plan-item {
		display: flex;
		align-items: center;
		padding: 1rem 2rem;
		border-bottom: 1px solid #f3f4f6;
		transition: background-color 0.2s ease;
		position: relative;
		gap: 1rem;
	}

	.plan-item:hover .delete-btn {
		opacity: 1;
		visibility: visible;
	}

	.travel-time {
		position: absolute;
		top: 0.75rem;
		right: 2rem;
		z-index: 10;
	}

	.travel-time-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		animation: slideInFromRight 0.3s ease;
		transition: all 0.3s ease;
	}

	.travel-time-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.travel-icon {
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		backdrop-filter: blur(5px);
	}

	.travel-time-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
	}

	.travel-time-text {
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.travel-time-label {
		font-size: 0.625rem;
		font-weight: 500;
		opacity: 0.9;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* 여행지 사이 이동 시간 구분선 스타일 */
	.travel-time-separator {
		display: flex;
		align-items: center;
		padding: 0.75rem 2rem;
		margin: 0.25rem 0;
	}

	.travel-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, #d1d5db, transparent);
	}

	.travel-time-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		margin: 0 1rem;
		font-size: 0.8rem;
		color: #64748b;
	}

	.travel-time-info .travel-icon {
		font-size: 1rem;
	}

	.travel-duration {
		font-weight: 600;
		color: #475569;
	}

	.travel-label {
		font-size: 0.7rem;
		opacity: 0.8;
	}

	/* 일차별 헤더 스타일 */
	.day-header {
		margin: 1.5rem 0 1rem 0;
		padding-left: 1.5rem;
	}

	.day-title {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.day-number {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		white-space: nowrap;
		min-width: fit-content;
	}

	.day-line {
		flex: 1;
		height: 2px;
		background: linear-gradient(to right, #3b82f6, #93c5fd, transparent);
		border-radius: 1px;
	}

	/* 일차 간 구분선 스타일 */
	.day-separator {
		margin: 2rem 0;
		padding: 0 2rem;
	}

	.day-separator-line {
		height: 1px;
		background: linear-gradient(to right, transparent, #e5e7eb, transparent);
		position: relative;
	}

	.day-separator-line::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: #e5e7eb;
		border-radius: 50%;
	}

	@keyframes slideInFromRight {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.plan-item:hover {
		background: #f9fafb;
	}

	.plan-item:last-child {
		border-bottom: none;
	}

	.plan-time {
		flex-shrink: 0;
		margin-right: 1rem;
	}

	.time-badge {
		display: inline-block;
		background: #4f46e5;
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 16px;
		font-size: 0.8rem;
		font-weight: 600;
		min-width: 50px;
		text-align: center;
	}

	.plan-details {
		flex: 1;
	}

	.plan-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: keep-all;
		hyphens: auto;
	}


	.plan-type {
		display: inline-block;
		background: #e0e7ff;
		color: #4f46e5;
		padding: 0.2rem 0.5rem;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.delete-btn {
		background: #fee2e2;
		color: #dc2626;
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		opacity: 0;
		visibility: hidden;
		z-index: 10;
	}

	.delete-btn:hover {
		background: #fecaca;
		transform: scale(1.1);
	}

	.delete-icon {
		font-size: 1rem;
		font-weight: bold;
	}

	.no-plan {
		text-align: center;
		padding: 3rem 2rem;
		color: #6b7280;
	}

	.no-plan p {
		font-size: 1rem;
		margin: 0;
	}

	/* 지도 마커 스타일 */
	:global(.custom-marker) {
		background: none !important;
		border: none !important;
	}

	:global(.marker-content) {
		background: #4f46e5;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
		border: 2px solid white;
		transition: all 0.3s ease;
		min-width: 60px;
	}

	:global(.marker-number) {
		font-size: 0.8rem;
		font-weight: 700;
		margin-bottom: 0.1rem;
	}

	:global(.marker-title) {
		font-size: 0.7rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 70px;
	}

	:global(.custom-marker.highlighted .marker-content) {
		background: #ef4444;
		transform: scale(1.2);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
		z-index: 1000;
	}

	:global(.marker-popup) {
		font-family: inherit;
	}

	:global(.marker-popup h4) {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1rem;
	}

	:global(.marker-popup p) {
		margin: 0.25rem 0;
		font-size: 0.875rem;
		color: #4b5563;
	}

	/* 반응형 모달 */
	@media (max-width: 768px) {
		.modal {
			width: 95%;
			margin: 1rem;
		}


		.sidebar {
			width: 100%;
		}

		.travel-plan-container {
			width: 100%;
		}

		.plan-item {
			padding: 1rem 1.5rem;
		}

		.delete-btn {
			top: 0.5rem;
			left: 0.5rem;
		}

		.travel-time {
			top: 0.5rem;
			right: 1.5rem;
		}

		.travel-time-card {
			padding: 0.4rem 0.6rem;
			gap: 0.4rem;
		}

		.travel-icon {
			width: 20px;
			height: 20px;
			font-size: 0.9rem;
		}

		.travel-time-text {
			font-size: 0.8rem;
		}

		.travel-time-label {
			font-size: 0.6rem;
		}

		.plan-title {
			font-size: 1rem;
		}

	}

	/* 검색 모달 스타일 */
	.search-modal {
		max-width: 500px;
		width: 90%;
	}

	.search-input-container {
		position: relative;
		margin-bottom: 1.5rem;
	}

	.search-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
		background: white;
	}

	.search-input:focus {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	.search-loading {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #6b7280;
		font-size: 0.9rem;
	}

	.search-results h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.results-list {
		max-height: 300px;
		overflow-y: auto;
	}

	.result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		margin-bottom: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		background: white;
	}

	.result-item:hover {
		border-color: #4f46e5;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
		transform: translateY(-1px);
	}

	.search-help {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.help-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.7;
	}

	.search-help h3 {
		font-size: 1.2rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem 0;
	}

	.search-help p {
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.5rem 0;
	}

	.search-examples {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.example-tag {
		background: #f3f4f6;
		color: #4b5563;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid #e5e7eb;
	}

	.example-tag:hover {
		background: #4f46e5;
		color: white;
		border-color: #4f46e5;
		transform: translateY(-1px);
	}

	.result-info {
		flex: 1;
		margin-right: 1rem;
	}

	.result-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: keep-all;
	}

	.result-location {
		font-size: 0.85rem;
		color: #6b7280;
		margin: 0 0 0.25rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: keep-all;
	}

	.result-description {
		font-size: 0.8rem;
		color: #9ca3af;
		margin: 0 0 0.5rem 0;
		line-height: 1.4;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: keep-all;
	}

	.result-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	.result-type {
		display: inline-block;
		background: #f3f4f6;
		color: #374151;
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	.result-rating {
		display: inline-block;
		background: #fef3c7;
		color: #92400e;
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	.result-price {
		display: inline-block;
		background: #d1fae5;
		color: #065f46;
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	.result-item .add-btn {
		background: #4f46e5;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.result-item .add-btn:hover {
		background: #4338ca;
		transform: scale(1.05);
	}

	.no-results {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.no-results p {
		margin: 0;
		font-size: 1rem;
	}

	/* 복사 성공 토스트 스타일 */
	.copy-success-toast {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 3000;
		animation: slideInFromRight 0.3s ease;
	}

	.toast-content {
		background: #10b981;
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.toast-icon {
		font-size: 1.2rem;
	}

	.toast-text {
		font-weight: 600;
		font-size: 0.9rem;
	}

	@keyframes slideInFromRight {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* 경로 화살표 스타일 */
	:global(.route-arrow) {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	:global(.arrow-icon) {
		color: #667eea;
		font-size: 16px;
		font-weight: bold;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		transition: all 0.2s ease;
	}

	:global(.arrow-icon:hover) {
		color: #4f46e5;
		transform: scale(1.2);
	}

	/* 경로 라인 애니메이션 효과 */
	:global(.leaflet-interactive) {
		transition: all 0.3s ease;
	}

	:global(.leaflet-interactive:hover) {
		stroke-width: 4 !important;
		stroke-opacity: 1 !important;
	}

	/* 마커 팝업 링크 스타일 */
	:global(.marker-popup) {
		font-family: 'Pretendard', sans-serif;
		max-width: 300px;
	}

	:global(.marker-popup h4) {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
		font-weight: 600;
	}

	:global(.marker-popup p) {
		margin: 0.25rem 0;
		color: #4b5563;
		font-size: 0.9rem;
	}

	:global(.popup-links) {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}

	:global(.popup-links p) {
		margin: 0 0 0.5rem 0;
		font-weight: 600;
		color: #374151;
	}

	:global(.links-container) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}



	:global(.popup-link) {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #f3f4f6;
		color: #4f46e5;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border: 1px solid #e5e7eb;
	}

	:global(.popup-link:hover) {
		background: #4f46e5;
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
	}

	/* 이동 시간 라벨 스타일 */
	:global(.travel-time-marker) {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	:global(.travel-time-label) {
		background: rgba(255, 255, 255, 0.95);
		color: #374151;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-align: center;
		border: 1px solid #e5e7eb;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(4px);
		white-space: nowrap;
	}
</style>