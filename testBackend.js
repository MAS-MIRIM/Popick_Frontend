// 백엔드 API 테스트 스크립트
const fetch = require('node-fetch');

const BASE_URL = 'http://api.hjun.kr/hackathon';

async function testCharacterAPIs() {
  console.log('🧪 백엔드 API 테스트 시작...\n');

  try {
    // 1. 캐릭터 목록 조회
    console.log('1. 캐릭터 목록 조회 (/characters/)');
    console.log('─'.repeat(50));
    const listResponse = await fetch(`${BASE_URL}/characters/`);
    const listData = await listResponse.json();
    console.log('Status:', listResponse.status);
    console.log('Total images:', listData.total);
    console.log('First few images:');
    if (listData.images && listData.images.length > 0) {
      listData.images.slice(0, 3).forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.category} - ${img.characterInfo?.name || 'Unknown'} - ${img.url}`);
      });
    }
    console.log('\n');

    // 2. 특정 캐릭터 정보 조회
    console.log('2. 캐릭터 정보 조회 (/characters/char-crybaby/info)');
    console.log('─'.repeat(50));
    const infoResponse = await fetch(`${BASE_URL}/characters/char-crybaby/info`);
    const infoData = await infoResponse.json();
    console.log('Status:', infoResponse.status);
    console.log('Response:', JSON.stringify(infoData, null, 2));
    console.log('\n');

    // 3. 캐릭터 이미지 조회
    console.log('3. 캐릭터 이미지 조회 (/characters/char-crybaby/0)');
    console.log('─'.repeat(50));
    const imageResponse = await fetch(`${BASE_URL}/characters/char-crybaby/0`);
    console.log('Status:', imageResponse.status);
    console.log('Content-Type:', imageResponse.headers.get('content-type'));
    console.log('Image URL:', `${BASE_URL}/characters/char-crybaby/0`);
    console.log('\n');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('백엔드 서버가 실행 중인지 확인하세요!');
  }
}

testCharacterAPIs();