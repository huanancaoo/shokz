import AccountInfo from "../account-info"

export default function ProfilePassword() {
  return (
    <AccountInfo
      label="비밀번호"
      currentInfo="비밀번호는 보안을 위해 표시하지 않습니다."
      data-testid="account-password-editor"
    />
  )
}
