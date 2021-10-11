# SET GEMS

## 목차
1. [소개](#set-gems-소개)
2. [개발 과정](#개발-과정)
3. [에러로그](#에러로그)

## SET GEMS 소개
https://user-images.githubusercontent.com/72963478/136772296-55e99e1b-ed79-44e0-a480-6fff8b3e0b19.mp4

- 웹 게임 주소: https://www.setgems.online/
- 사용 기술 스택
  - MERN(MongoDB, Express, React, Node)
  - socket.io
  - simple-peer
- 특징
  - 프로그레시브 웹 앱으로 만들어져 네트워크 없이도 혼자하기를 진행할 수 있습니다.
  - socket.io를 이용하여 멀리 떨어진 사람과도 방 이름을 공유하기만 하면 함께 같이하기를 즐길 수 있습니다.
  - webRTC를 이용해 같이하기 모드에서는 화상통화를 이용할 수 있습니다.


## 개발 과정
이 프로젝트는 총 3주의 기간을 거쳐 구현하였습니다.

### 1주차: 기획
- simple-peer 라이브러리 시연
- 목업: [Figma](https://www.figma.com/file/vSOrS4IR4D2XlizT8qo7bR/SET-GEMS-Mockup?node-id=0%3A1)
- 데이터베이스 스키마: [Lucid Chart](https://lucid.app/lucidchart/dab0b8b7-bcc2-463c-9993-3081e038c37c/view)
- 태스크 보드: [Github Project](https://github.com/orgs/SET-GEMS/projects/1)

### 2주차: 개발
- [서버] express 설정, 소켓 연결
- [클라이언트] 웰컴 페이지, 혼자하기 모드, 같이하기 모드
- 배포
  - [클라이언트] netlify 배포
  - [서버] Amazon Elastic Beanstalk 배포
- [클라이언트] Service worker 추가

### 3주차: 마무리
- 시범 운영 후 피드백 반영
 - 프로젝트 소개 및 ReadMe 작성
 - [서버, 클라이언트] 테스트 작성


## 에러로그

### 힌트시간을 길게 설정했을 시 잘못된 힌트가 보여짐
- 태스크 카드: [#2 혼자하기 플레이 페이지](https://github.com/SET-GEMS/set-gems-client/issues/2)
- 원인
  - 새로운 카드가 바닥에 배치될 때마다 setTimeout으로 일정 시간 후에 힌트를 보여주도록 설정
  - 힌트 시간이 다 지나기도 전에 새로운 카드가 배치됐을 경우, 이전에 예약되었던 힌트가 보여짐.
- 수정사항: 이전 hintTimer를 state로 설정하여 새로운 힌트가 생기면 이전의 힌트타이머를 제거하도록 함.

### 같이하기 방에 3명 이상 입장 시 기존의 peer의 연결이 끊김
- 태스크 카드: [#6 같이하기 대기 페이지](https://github.com/SET-GEMS/set-gems-client/issues/6)
- 원인: socket의 이벤트리스너가 중복으로 등록되면서 같은 peer가 반복적으로 생성되어 연결이 끊김
- 수정사항: useEffect의 반환값에서 socket.removeAllListeners 메소드로 socket 이벤트리스너를 정리함.

### 플레이 중 플레이어 퇴장 시 카운트다운 멈춤
- 태스크 카드: [#21 커스텀 훅 사용으로 관심사 분리](https://github.com/SET-GEMS/set-gems-client/issues/21)
- 원인
  - socket의 이벤트리스너들을 hook으로 분리하여 각각 Player컴포넌트에서 등록하게 함.
  - socket 이벤트의 정리는 이전과 같이 socket.removeAllListeners를 사용.
  - 플레이어가 나가면 Player 컴포넌트가 언마운트 되면서 다른 컴포넌트에서 사용중인 socket의 이벤트리스너까지 전부 지워짐.
- 수정사항: 중복으로 사용되는 이벤트의 경우, socket.off 메소드로 개별 이벤트리스너를 지우는 방식으로 바꿈.

### 퇴장 후 재입장 시 화상연결이 되지 않음
- 태스크 카드: [#7 같이하기 게임 플레이 페이지](https://github.com/SET-GEMS/set-gems-client/issues/7)
- 원인
  - 플레이어가 퇴장 후 남은 플레이어의 Peer는 peer.destroy 메소드를 이용하여 정리를 함.
  - 퇴장하는 플레이어에서도 state를 정리하면서 peers를 빈 배열로 바꿈.
  - 하지만 peers 배열에 담긴 peer를 따로 종료시키지는 않음.
  - 플레이어가 방에 재입장 시 다시 peer를 생성해도 peer id가 같아 기존 peer로 인식.
  - 남은 플레이어쪽에서 재입장한 유저의 정보를 받아 peer를 다시 생성하더라도 이미 파괴된 것으로 인식하여 연결되지 않음.
- 플레이어 퇴장 시 peers를 빈 배열로 재설정할 때, 기존 peers에 담긴 peer들도 peer.destroy 메소드로 정리함.

### Service Worker 적용 후, 서버와의 연결이 끊김
- 태스크 카드: [#29 프로그레시브 웹 앱 적용](https://github.com/SET-GEMS/set-gems-client/issues/29)
- 원인: service worker의 fetch 이벤트리스너가 cors 요청을 처리하지 못함.
- 수정: cors 요청은 service worker의 fetch 이벤트 리스너가 처리하지 않게 조건문으로 cors요청을 걸러냄.
