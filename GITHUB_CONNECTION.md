# GitHub 연결 기록

이 프로젝트는 내부 원격 저장소(`origin`)를 유지한 채, 외부 GitHub 원격 저장소를 `github` 이름으로 추가하여 동기화합니다. 이 방식은 홈페이지의 기존 개발·배포 흐름을 보존하면서 GitHub에서 소스 이력과 협업을 관리할 수 있도록 합니다.

| 항목 | 값 |
| --- | --- |
| GitHub 저장소 | `https://github.com/seo100522-svg/2026-2-mind-check` |
| GitHub 원격 이름 | `github` |
| 동기화 브랜치 | `main` |
| 최초 반영 커밋 | `28d3ee8` (`chore: record GitHub repository connection`) |
| 반영 방식 | GitHub의 초기 `README.md` 커밋을 보존한 병합 후, 현재 홈페이지 소스를 `main` 브랜치에 푸시 |

연결 시점에 `pnpm test`, `pnpm run check`, `pnpm run build`를 실행했습니다. 테스트 20개 파일의 53개 항목과 TypeScript 검사 및 프로덕션 빌드가 통과했으며, 빌드 과정에서 향후 코드 분할을 고려할 수 있는 JavaScript 청크 크기 경고가 한 건 표시되었습니다.

일상적인 동기화는 프로젝트 루트에서 `git push github main` 명령으로 수행합니다. 기존 내부 원격 저장소(`origin`)는 변경하거나 제거하지 않습니다.
