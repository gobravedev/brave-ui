import { FC } from "react"
import { List } from "react-window";
function Example({ names }: { names: string[] }) {
  return (
    <List
      rowComponent={RowComponent}
      rowCount={names.length}
      rowHeight={25}
      rowProps={{ names }}
    />
  );
}

import { type RowComponentProps } from "react-window";
function RowComponent({
  index,
  names,
  style
}: RowComponentProps<{
  names: string[];
}>) {
  return (
    <div className="flex items-center justify-between" style={style}>
      {/* {names[index]} */}
      <div className="text-slate-500 text-xs">{`${index + 1} of ${names.length}`}</div>
    </div>
  );
}
const App: FC<any> = () => {

  return <div style={{height: '400px'}}>
    <Example names={Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`)} />
  </div>
}

export default App

