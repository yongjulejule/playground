import { useState } from 'react';
import './App.css';
import { DefaultTab } from './Default';
import { UploadWithChunk } from './UploadWithChunk';
import { UploadWithoutChunk } from './UploadWithoutChunk';
import { UploadWithChunkResult } from './UploadWithChunkResult';
import { UploadWithoutChunkResult } from './UploadWithoutChunkResult';

function App() {
  const [count, setCount] = useState(0);
  const [tab1, setTab1] = useState(0);

  return (
    <>
      <div id="tab" className="tab">
        <button onClick={() => setTab1(0)}>디폴트 탭</button>
        <button onClick={() => setTab1(1)}>
          프리사인드로 요청을 날려볼까?
        </button>
        <button onClick={() => setTab1(2)}>짤라서 보내볼까?</button>
        <button onClick={() => setTab1(3)}>프리사인드 결과를 한번 볼까?</button>
        <button onClick={() => setTab1(4)}>
          짤라서 보낸 결과를 한번 볼까?
        </button>
      </div>

      {tab1 === 0 && <DefaultTab count={count} setCount={setCount} />}
      {tab1 === 1 && <UploadWithoutChunk />}
      {tab1 === 2 && <UploadWithChunk />}
      {tab1 === 3 && <UploadWithoutChunkResult />}
      {tab1 === 4 && <UploadWithChunkResult />}
    </>
  );
}

export default App;
