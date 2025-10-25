---
description: 'Feature ブランチから main ブランチへの Pull Request を作成します。GitHub CLI (gh) を使用して自動的にPRを作成し、適切なタイトルと説明を生成します。'
allowed-tools: Bash(git:*, gh:*)
---

# Claude Code カスタムスラッシュコマンド: Pull Request 作成 (`/create-pr`)

このスラッシュコマンドは、現在の feature ブランチから `main` ブランチへの Pull Request を GitHub CLI (`gh`) を使用して自動作成します。

---

## Main Instruction (Initial Prompt for Claude)

**Instruction**: Create a Pull Request from the current feature branch to the `main` branch using GitHub CLI (`gh` command). Automatically generate an appropriate PR title and description based on recent commits and changes.

**Constraints and Operational Rules**

- **ALWAYS answer in Japanese**.
- Verify that the current branch is NOT `main` before proceeding.
- Ensure all changes are committed and pushed to the remote feature branch.
- Generate a clear and concise PR title and description.
- Use `gh pr create` command with appropriate flags.
- After PR creation, display the PR URL to the user.

---

## Execution Flow (Checklist)

1. **Branch Verification**

   - Check current branch: `git branch --show-current`
   - **STOP if on `main` branch** - display error message
   - Verify branch name follows convention (feature/, fix/, docs/, test/)

2. **Commit Status Check**

   - Check for uncommitted changes: `git status --porcelain`
   - If uncommitted changes exist, prompt user to commit first
   - Verify local branch is up to date with remote

3. **Remote Branch Status**

   - Check if current branch exists on remote: `git ls-remote --heads origin $(git branch --show-current)`
   - If not pushed, display error and instruct to push first

4. **Analyze Recent Changes**

   - Get list of commits since branching from main: `git log main..HEAD --oneline`
   - Read recent commit messages to understand the scope of changes
   - Optionally check `report/DIARY*.md` for session summary

5. **Generate PR Content**

   - **Title**: Concise summary of changes (max 72 characters)
     - Format: `[Type] Short description`
     - Types: feat, fix, docs, test, refactor, chore
     - Example: `feat: improve test coverage to 85%`

   - **Description**: Detailed PR body including:
     ```markdown
     ## Summary
     <Brief overview of changes>

     ## Changes
     - <List of key changes>
     - <Organized by component/area>

     ## Testing
     - <Test results>
     - Coverage: X%
     - All tests passing: ✅/❌

     ## Related
     - Session: #NNN
     - Related issues: (if any)

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```

6. **Create Pull Request**

   Execute `gh pr create` with:
   ```bash
   gh pr create \
     --base main \
     --head <current-branch> \
     --title "<generated-title>" \
     --body "<generated-description>"
   ```

7. **Confirmation**

   - Display PR URL
   - Show PR number
   - Provide next steps (e.g., request review, check CI status)

---

## Command Examples

### Check if `gh` is installed and authenticated
```bash
gh auth status
```

### Create PR interactively (if automatic generation fails)
```bash
gh pr create --base main --web
```

### Create PR with title and body from file
```bash
gh pr create --base main --title "feat: add new feature" --body-file pr-description.md
```

### View created PRs
```bash
gh pr list
```

### View PR details
```bash
gh pr view <PR-number>
```

---

## Error Handling

1. **Not on feature branch**: Display error, instruct to switch to feature branch
2. **Uncommitted changes**: Display error, instruct to commit changes first
3. **Branch not pushed**: Display error, instruct to push branch first
4. **`gh` not installed**: Display installation instructions
5. **Not authenticated with GitHub**: Instruct to run `gh auth login`
6. **PR already exists**: Display existing PR URL

---

## PR Title Guidelines

- **feat**: New feature or enhancement
  - Example: `feat: add user authentication`
- **fix**: Bug fix
  - Example: `fix: resolve login error`
- **test**: Test improvements
  - Example: `test: improve coverage to 85%`
- **docs**: Documentation updates
  - Example: `docs: update API documentation`
- **refactor**: Code refactoring
  - Example: `refactor: simplify user service`
- **chore**: Maintenance tasks
  - Example: `chore: update dependencies`

---

## Output Style (for Claude)

1. **First**: Verify prerequisites (branch, commits, push status)
2. **Analyze**: Review recent commits and changes
3. **Generate**: Create clear PR title and description
4. **Execute**: Run `gh pr create` command
5. **Confirm**: Display PR URL and next steps in Japanese
6. **Helpful**: Provide suggestions for PR review process if needed

---

## Example Session

```
ユーザー: /create-pr

Claude:
現在のブランチを確認しています...
✅ ブランチ: feature/session-034-coverage-improvement

コミット状況を確認しています...
✅ すべての変更がコミット済み

リモートブランチを確認しています...
✅ リモートにプッシュ済み

最近のコミットを分析しています...
- test: improve coverage and fix test warnings (81.6% → 83.9%)
- docs: update start-dev command to use feature branch workflow

Pull Request を作成します...

タイトル: test: improve test coverage to 83.9%

説明:
## Summary
Session 033で実施したテストカバレッジ改善と警告修正

## Changes
- Element Plus コンポーネントスタブ追加 (el-button, el-icon, el-tooltip)
- useTraining.spec.ts に5つの新規テスト追加
- Functions カバレッジ: 81.6% → 83.9% (+2.3pt)

## Testing
- Tests: 438 passing (100%)
- Coverage: 83.9% (target 85%, gap -1.1pt)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

✅ Pull Request が作成されました！

PR URL: https://github.com/user/repo/pull/123
PR番号: #123

次のステップ:
1. PRをレビュー依頼
2. CIステータスを確認
3. 承認後にマージ
```

---

## Notes

- このコマンドは `gh` (GitHub CLI) がインストールされていることを前提とします
- 初回使用時は `gh auth login` で GitHub 認証が必要です
- PR作成後、自動的にブラウザでPRページを開くこともできます (--web フラグ)
