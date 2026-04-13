export default function ConfirmDialog({ onOk, onCancel }:any) {
  return (
    <div>
      <h3>确认操作？</h3>
      <button onClick={() => onOk(true)}>确定</button>
      <button onClick={onCancel}>取消</button>
    </div>
  );
}