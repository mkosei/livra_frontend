"use client";

export default function Welcome() {
    return (
        <div className="flex flex-col items-center justify-center text-center text-foreground space-y-12 min-h-[80vh]">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">ようこそ Livra へ ✨</h2>
            <p className="mb-4 max-w-lg mx-auto text-foreground/70">
            Livraは、エンジニアのための知識・メモをシェアするプラットフォームです。  
            </p>
            <p className="mb-4 max-w-xl mx-auto text-foreground/70">
            1人の気づきや工夫が、他の誰かの開発を助ける。  
            そんな小さなメモが集まることで、日本のエンジニアリングの発展を支える「知識の資産」になります。
            </p>
            <p className="mb-6 max-w-xl mx-auto text-foreground/70 italic">
            技術ブログや技術書のような立派なものでなくても構いません。  
            どんな小さなことでも、ラフなメモでもきっと誰かの役に立ちます。  
            気軽にシェアしてください。
            </p>
            <div className="flex gap-3 justify-center">
            <span className="px-5 py-2 rounded-full bg-blue-400 text-white">
                🔍 役立つメモを見つけてください
            </span>
            <span className="px-5 py-2 rounded-full bg-blue-400 text-white">
                ✏️ あなたの経験をシェアしてください
            </span>
            </div>
        </div>
        </div>
    )
}
