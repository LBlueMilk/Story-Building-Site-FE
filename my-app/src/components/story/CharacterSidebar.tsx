// /src/components/story/CharacterSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCharacters, saveCharacters } from '@/services/character.client';
import { useAuth } from '@/context/AuthContext';
import NewCharacterDialog from './NewCharacterDialog';
import AttributeEditor from './AttributeEditor';

interface Props {
    storyId: number;
}

export default function CharacterSidebar({ storyId }: Props) {
    const { token } = useAuth();
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [initialized, setInitialized] = useState(false);

    const handleAttrChange = async (index: number, newAttrs: Record<string, string>) => {
        const updated = characters.map((char, i) =>
            i === index ? { ...char, attributes: newAttrs } : char
        );
        setCharacters(updated);

        try {
            const res = await saveCharacters(storyId, { characters: updated });
            console.log('✅ 屬性即時儲存成功', res.message);
        } catch (err) {
            console.error('❌ 屬性儲存失敗', err);
        }
    };

    useEffect(() => {
        if (!token || !storyId) return;

        setLoading(true);
        getCharacters(storyId)
            .then((res) => {
                setCharacters(res?.characters || []);
            })
            .catch((err) => console.error('❌ 載入角色失敗', err))
            .finally(() => setLoading(false));
    }, [token, storyId]);

    const handleAddCharacter = async (name: string, desc: string) => {
        const newChar = {
            name,
            desc,
            attributes: {},
            relations: [],
        };
        const newList = [...characters, newChar];
        setCharacters(newList);

        try {
            const res = await saveCharacters(storyId, { characters: newList });
            console.log('✅ 角色儲存成功', res.message);
        } catch (err) {
            console.error('❌ 儲存角色失敗', err);
        }
    };

    const handleMetaChange = async (index: number, field: 'name' | 'desc', value: string) => {
        const updated = characters.map((char, i) =>
            i === index ? { ...char, [field]: value } : char
        );
        setCharacters(updated);

        try {
            const res = await saveCharacters(storyId, { characters: updated });
            console.log(`✅ ${field} 即時儲存成功`, res.message);
        } catch (err) {
            console.error(`❌ ${field} 儲存失敗`, err);
        }
    };


    return (
        <div className="w-full p-4 bg-slate-50 border-l h-full overflow-y-auto">
            <h2 className="font-semibold text-lg mb-2">角色列表</h2>
            <NewCharacterDialog onSubmit={handleAddCharacter} />

            {loading && <p className="text-sm text-gray-400">載入中...</p>}
            {!loading && (!characters || characters.length === 0) && (
                <p className="text-sm text-gray-500">尚未新增角色</p>
            )}
            <ul className="space-y-4 mt-4">
                {characters.map((char, index) => (
                    <li key={index} className="p-2 bg-white rounded shadow text-sm">
                        {/* 標題列可點擊展開屬性 */}
                        <div
                            className="flex justify-between items-center cursor-pointer mb-2"
                            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                        >
                            <div className="font-bold text-gray-900">
                                {char.name || '未命名角色'}
                            </div>
                            <div className="text-gray-400 text-xs">點擊展開屬性</div>
                        </div>

                        {/* 姓名與描述欄位可編輯，但不會觸發 onClick */}
                        <input
                            className="font-bold text-lg mb-1 bg-white border border-gray-300 rounded px-2 py-1 outline-none w-full"
                            value={char.name}
                            placeholder="輸入角色名稱"
                            onChange={(e) => handleMetaChange(index, 'name', e.target.value)}
                        />
                        <input
                            className="text-sm text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 outline-none w-full"
                            value={char.desc}
                            placeholder="輸入角色描述"
                            onChange={(e) => handleMetaChange(index, 'desc', e.target.value)}
                        />

                        {selectedIndex === index && (
                            <div className="mt-2">
                                <AttributeEditor
                                    attributes={char.attributes}
                                    onChange={(newAttrs) => handleAttrChange(index, newAttrs)}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
