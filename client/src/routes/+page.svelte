<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let mapContainer: HTMLDivElement;
	let map: any;
	let L: any;
	let isLoading = true;

	// 모달 및 사이드바 상태 관리
	let showThemeModal = false;
	let showAiModal = false;
	let showSidebar = false;
	let aiInput = '';
	
	// 여행 계획 상태 관리
	let travelPlan: any[] = [];
	let travelPlanInfo: any = {};
	let showTravelPlan = false;

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
			case 'theme':
				showThemeModal = true;
				break;
			case 'ai':
				showAiModal = true;
				break;
			case 'free':
				showSidebar = true;
				break;
		}
	}

	// 테마 선택 핸들러
	function handleThemeSelect(themeName: string) {
		showThemeModal = false;
		// 여기서 다음 단계로 넘어가는 로직 구현
	}

	// AI 생성 핸들러
	async function handleAiGenerate() {
		if (!aiInput.trim()) {
			alert('여행에 대한 설명을 입력해주세요.');
			return;
		}

		try {
			// 버튼 상태 변경
			const generateBtn = document.querySelector('.action-btn.primary') as HTMLButtonElement;
			if (generateBtn) {
				const originalText = generateBtn.textContent;
				generateBtn.textContent = '생성 중...';
				generateBtn.disabled = true;
			}

			const response = await fetch('http://localhost:3001/api/travel-plan/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userInput: aiInput })
			});

			const result = await response.json();

			if (result.success) {
				// 여행 계획 데이터 파싱 및 저장
				if (result.plan && Array.isArray(result.plan)) {
					travelPlan = result.plan;
				} else if (result.data && Array.isArray(result.data)) {
					travelPlan = result.data;
				} else {
					// JSON 문자열인 경우 파싱
					try {
						const parsedPlan = JSON.parse(result.plan || result.data || '[]');
						travelPlan = Array.isArray(parsedPlan) ? parsedPlan : [];
					} catch {
						travelPlan = [];
					}
				}

				// 여행 계획 정보 저장 (title, summary, duration 등)
				if (result.originalData) {
					travelPlanInfo = result.originalData;
				} else if (result.planInfo) {
					travelPlanInfo = result.planInfo;
				} else {
					// 기본 정보 설정
					travelPlanInfo = {
						title: '전라북도 여행 계획',
						summary: aiInput,
						duration: '1-2일',
						budget: {
							estimated: '5-10만원',
							breakdown: '교통비, 식비, 입장료 포함'
						}
					};
				}
				
				showAiModal = false;
				showTravelPlan = true;
				aiInput = '';
			} else {
				alert('여행 계획 생성에 실패했습니다: ' + result.error);
			}
		} catch (error) {
			console.error('AI 생성 오류:', error);
			alert('여행 계획 생성 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
		} finally {
			// 버튼 상태 복원
			const generateBtn = document.querySelector('.action-btn.primary') as HTMLButtonElement;
			if (generateBtn) {
				generateBtn.textContent = '계획 생성하기';
				generateBtn.disabled = false;
			}
		}
	}

	// 모달 닫기 핸들러
	function closeModals() {
		showThemeModal = false;
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

	// 여행 계획 초기화 핸들러
	function resetTravelPlan() {
		showTravelPlan = false;
		travelPlan = [];
		travelPlanInfo = {};
	}

	onMount(async () => {
		if (!browser) return;
		
		try {
			L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');

			map = L.map(mapContainer).setView(jeonbukCenter, 9);

			// 컬러 배경 타일 (전체 지역)
			const colorLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				className: 'color-tiles'
			}).addTo(map);

			// southkorea-maps에서 GeoJSON 데이터 불러오기
			let data;
			try {
				const response = await fetch('https://raw.githubusercontent.com/southkorea-maps/southkorea-maps.github.io/master/geojson/TL_SCCO_CTPRVN.json', {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
					},
					mode: 'cors'
				});
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				data = await response.json();
			} catch (error) {
				console.warn('GeoJSON 데이터 로드 실패, 기본 지도로 대체:', error);
				// GeoJSON 로드 실패 시 기본 지도만 표시
				map.setView(jeonbukCenter, 9);
				setTimeout(() => {
					map.invalidateSize();
					isLoading = false;
				}, 100);
				return;
			}

			// 전라북도만 필터링 (CTPRVN_NM이 '전라북도'인 것)
			const jeonbuk = data.features.find(
				(f: any) => f.properties.CTPRVN_NM === '전라북도'
			);

			if (jeonbuk) {
				// 전라북도 경계선과 영역 표시
				const jeonbukLayer = L.geoJSON(jeonbuk, {
					style: {
						fillColor: '#667eea',
						fillOpacity: 0.1,
						color: '#667eea',
						weight: 3,
						opacity: 0.9,
						dashArray: '10, 5'
					}
				}).addTo(map);

				// 전라북도 영역에 강조된 컬러 타일 레이어 추가
				const highlightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '© OpenStreetMap contributors',
					className: 'highlight-tiles'
				}).addTo(map);

				// 전라북도 영역을 클리핑 마스크로 사용
				jeonbukLayer.eachLayer((layer: any) => {
					const bounds = layer.getBounds();
					
					// 전라북도 영역에만 강조된 컬러 타일 표시하도록 CSS 클리핑 적용
					const mapContainer = map.getContainer();
					const highlightTiles = mapContainer.querySelector('.highlight-tiles');
					
					if (highlightTiles) {
						// 전라북도 영역을 클리핑 패스로 설정
						const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
						svg.style.position = 'absolute';
						svg.style.top = '0';
						svg.style.left = '0';
						svg.style.width = '100%';
						svg.style.height = '100%';
						svg.style.pointerEvents = 'none';
						
						const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
						const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
						clipPath.setAttribute('id', 'jeonbuk-clip');
						
						const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
						// 전라북도 경계를 SVG 패스로 변환
						const coordinates = jeonbuk.geometry.coordinates[0];
						const pathData = coordinates.map((coord: number[], index: number) => {
							const [lng, lat] = coord;
							const point = map.latLngToContainerPoint([lat, lng]);
							return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
						}).join(' ') + ' Z';
						
						path.setAttribute('d', pathData);
						clipPath.appendChild(path);
						defs.appendChild(clipPath);
						svg.appendChild(defs);
						
						mapContainer.appendChild(svg);
						highlightTiles.style.clipPath = 'url(#jeonbuk-clip)';
					}
				});

				// 지도 범위를 전라북도에 맞게 조정
				map.fitBounds(jeonbukLayer.getBounds());
			}

			// 지도 크기 조정
			setTimeout(() => {
				map.invalidateSize();
				isLoading = false;
			}, 100);
		} catch (error) {
			console.error('지도 로드 중 오류 발생:', error);
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
		<h1>Ondam</h1>
	</div>
	
	<!-- 여행 옵션 버튼들 -->
	<div class="travel-options" class:hidden={showSidebar || showTravelPlan}>
		<button class="option-btn" data-theme="theme" on:click={handleOptionClick}>
			<span class="btn-icon">🎯</span>
			<span class="btn-text">테마 여행</span>
		</button>
		<button class="option-btn" data-theme="ai" on:click={handleOptionClick}>
			<span class="btn-icon">🤖</span>
			<span class="btn-text">AI로 생성</span>
		</button>
		<button class="option-btn" data-theme="free" on:click={handleOptionClick}>
			<span class="btn-icon">✈️</span>
			<span class="btn-text">자유 여행</span>
		</button>
	</div>
	
	<!-- 테마 여행 모달 -->
	{#if showThemeModal}
		<div class="modal-overlay" on:click={closeModals}>
			<div class="modal" on:click|stopPropagation>
				<div class="modal-header">
					<h2>테마 여행</h2>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				<div class="modal-content">
					<div class="theme-grid">
						<button class="theme-card" on:click={() => handleThemeSelect('역사 탐방')}>
							<span class="theme-icon">🏛️</span>
							<span class="theme-name">역사 탐방</span>
						</button>
						<button class="theme-card" on:click={() => handleThemeSelect('맛집 투어')}>
							<span class="theme-icon">🍜</span>
							<span class="theme-name">맛집 투어</span>
						</button>
						<button class="theme-card" on:click={() => handleThemeSelect('자연 힐링')}>
							<span class="theme-icon">🌿</span>
							<span class="theme-name">자연 힐링</span>
						</button>
						<button class="theme-card" on:click={() => handleThemeSelect('가족 여행')}>
							<span class="theme-icon">👨‍👩‍👧‍👦</span>
							<span class="theme-name">가족 여행</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- AI 생성 모달 -->
	{#if showAiModal}
		<div class="modal-overlay" on:click={closeModals}>
			<div class="modal" on:click|stopPropagation>
				<div class="modal-header">
					<h2>어떤 여행을 만들고 싶으신가요?</h2>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				<div class="modal-content">
					<textarea 
						bind:value={aiInput}
						placeholder="예시) 가족과 함께하는 전주 여행, 맛집과 전통문화 체험을 원해요"
						class="ai-textarea"
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleAiGenerate();
							}
						}}
					></textarea>
					<div class="modal-actions">
						<button class="action-btn primary" on:click={handleAiGenerate}>계획 생성하기</button>
						<button class="action-btn secondary" on:click={closeModals}>닫기</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 자유 여행 사이드바 -->
	{#if showSidebar}
		<div class="sidebar-overlay" on:click={handleSidebarOverlayClick}>
			<div class="sidebar">
				<div class="sidebar-header">
					<button class="add-btn">+</button>
					<button class="close-btn" on:click={closeSidebar}>×</button>
				</div>
				<div class="sidebar-content">
					<p class="sidebar-message">일정을 추가해 보세요.</p>
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
						{#if travelPlanInfo.budget?.estimated}
							<span class="meta-item">💰 {travelPlanInfo.budget.estimated}</span>
						{/if}
					</div>
				</div>
				<button class="close-plan-btn" on:click={resetTravelPlan}>×</button>
			</div>
			<div class="travel-plan-content">
				{#if travelPlan.length > 0}
					{#each travelPlan as item, index}
						<div class="plan-item">
							<div class="plan-time">
								<span class="time-badge">{item.time || `${index + 1}번째`}</span>
							</div>
							<div class="plan-details">
								<h3 class="plan-title">{item.title || item.location || `활동 ${index + 1}`}</h3>
							</div>
						</div>
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
		<div class="loading">
			지도를 불러오는 중...
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
		background: #fafbfc;
		overflow: hidden;
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
	}

	.map {
		width: 100%;
		height: 100%;
	}

	.loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		color: #667eea;
		font-size: 18px;
		font-weight: 500;
		background: rgba(255, 255, 255, 0.9);
		padding: 1rem 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

	.logo h1 {
		font-size: 3rem;
		font-weight: 800;
		color: #1f2937;
		margin: 0;
		letter-spacing: -0.02em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* 여행 옵션 버튼들 */
	.travel-options {
		position: absolute;
		bottom: 4rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1.5rem;
		z-index: 1000;
	}

	.option-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem 2.5rem;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 24px;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		min-width: 160px;
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
		background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.option-btn:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		background: rgba(255, 255, 255, 1);
		border-color: rgba(79, 70, 229, 0.2);
	}

	.option-btn:hover::before {
		opacity: 1;
	}

	.option-btn:active {
		transform: translateY(-4px) scale(0.98);
	}

	.btn-icon {
		font-size: 2.5rem;
		line-height: 1;
		position: relative;
		z-index: 1;
	}

	.btn-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: #1f2937;
		line-height: 1;
		position: relative;
		z-index: 1;
		letter-spacing: -0.01em;
	}

	/* 반응형 디자인 */
	@media (max-width: 768px) {
		.logo {
			top: 1.5rem;
			left: 2rem;
		}

		.logo h1 {
			font-size: 2.5rem;
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
			font-size: 2rem;
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

	/* 테마 그리드 */
	.theme-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: #f9fafb;
		border: 2px solid #e5e7eb;
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.theme-card:hover {
		background: #f3f4f6;
		border-color: #4f46e5;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
	}

	.theme-icon {
		font-size: 2rem;
	}

	.theme-name {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
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
		margin-top: 2rem;
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
	}

	.plan-title-section {
		padding-right: 3rem;
	}

	.travel-plan-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
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

	.close-plan-btn {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
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

	.close-plan-btn:hover {
		background: #e5e7eb;
		color: #374151;
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
		margin: 0;
		line-height: 1.3;
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

	/* 반응형 모달 */
	@media (max-width: 768px) {
		.modal {
			width: 95%;
			margin: 1rem;
		}

		.theme-grid {
			grid-template-columns: 1fr;
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

		.plan-title {
			font-size: 1rem;
		}

		.plan-description {
			font-size: 0.9rem;
		}
	}
</style>