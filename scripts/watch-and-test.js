#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 자동 테스트 모드 시작...');
console.log('📝 코드 변경 시 자동으로 테스트가 실행됩니다.');
console.log('');

// 감시할 디렉토리들
const watchDirs = ['screens', 'utils', 'navigation'];
const testCommand = 'npm';
const testArgs = ['test'];

// 파일 변경 감지 및 테스트 실행
let testProcess = null;
let debounceTimer = null;

function runTests() {
  if (testProcess) {
    console.log('⏹️  이전 테스트 중단...');
    testProcess.kill();
  }

  console.log('\n🧪 테스트 실행 중...');
  console.log('─'.repeat(50));
  
  testProcess = spawn(testCommand, testArgs, { stdio: 'inherit' });
  
  testProcess.on('close', (code) => {
    console.log('─'.repeat(50));
    if (code === 0) {
      console.log('✅ 모든 테스트 통과!');
    } else {
      console.log('❌ 테스트 실패! 코드를 수정해주세요.');
    }
    console.log('\n👀 파일 변경 감시 중...\n');
  });
}

function handleFileChange(filename) {
  console.log(`📝 파일 변경 감지: ${filename}`);
  
  // 디바운싱: 연속적인 변경 시 마지막 변경 후 1초 후에 테스트 실행
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runTests();
  }, 1000);
}

// 파일 감시 시작
watchDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  
  if (fs.existsSync(dirPath)) {
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
        handleFileChange(path.join(dir, filename));
      }
    });
    console.log(`👁️  감시 중: ${dir}/`);
  }
});

// 초기 테스트 실행
console.log('\n📊 초기 테스트 실행...');
runTests();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n\n🛑 자동 테스트 종료');
  if (testProcess) {
    testProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (testProcess) {
    testProcess.kill();
  }
  process.exit(0);
});