// /src/components/story/CharacterSidebar.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { getCharacters, saveCharacters } from '@/services/character.client';
import { useAuth } from '@/context/AuthContext';
import NewCharacterDialog from './NewCharacterDialog';
import AttributeEditor from './AttributeEditor';
import { toastSuccess, toastError } from '@/lib/toastUtils';

interface Props {
    storyId: number;
}

export default function CharacterSidebar({ storyId }: Props) {
    const { token, isReady } = useAuth();
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const cache = useRef<{ [storyId: number]: any[] }>({});

    const handleAttrChange = async (
        index: number,
        newAttrs: Record<string, string>
    ) => {
        const currentAttrs = characters[index]?.attributes ?? {};
        const cleanedAttrs = Object.fromEntries(
            Object.entries(newAttrs).filter(([k]) => k.trim() !== '')
        );

        const hasChanged =
            JSON.stringify(cleanedAttrs) !== JSON.stringify(currentAttrs) &&
            Object.keys(cleanedAttrs).length > 0;

        if (!hasChanged) {
            console.log('🛑 屬性無變更或為空，跳過儲存');
            return;
        }

        const updated = characters.map((char, i) =>
            i === index ? { ...char, attributes: cleanedAttrs } : char
        );

        setCharacters(updated);
        setIsSaving(true);

        try {
            const res = await saveCharacters(storyId, { characters: updated });
            console.log('✅ 屬性儲存成功', res.message);
            toastSuccess('儲存成功', '角色屬性已更新');
        } catch (err) {
            console.error('❌ 屬性儲存失敗', err);
            toastError('儲存失敗', '請稍後再試');
        } finally {
            setIsSaving(false);
        }
    };

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
            toastSuccess('新增成功', `已新增角色「${name}」`);
        } catch (err) {
            console.error('❌ 儲存角色失敗', err);
            toastError('新增角色失敗', '請稍後再試');
        }
    };

    const handleMetaChange = async (
        index: number,
        field: 'name' | 'desc',
        value: string
    ) => {
        const updated = characters.map((char, i) =>
            i === index ? { ...char, [field]: value } : char
        );
        setCharacters(updated);

        try {
            const res = await saveCharacters(storyId, { characters: updated });
            console.log(`✅ ${field} 即時儲存成功`, res.message);
        } catch (err) {
            console.error(`❌ ${field} 儲存失敗`, err);
            toastError(`${field} 儲存失敗`, '請稍後再試');
        }
    };


    useEffect(() => {
        if (!token || !storyId || !isReady) return;

        setLoading(true);
        getCharacters(storyId)
            .then((res) => {
                console.log('📥 取得角色資料（從後端）：', res.characters);
                setCharacters(res?.characters || []);
            })
            .catch((err) => console.error('❌ 載入角色失敗', err))
            .finally(() => setLoading(false));
    }, [token, storyId, isReady]);


    return (
        <div className="w-full p-4 bg-slate-50 border-l h-full overflow-y-scroll scrollbar-thin">
            <h2 className="font-semibold text-lg mb-2 text-center">角色列表</h2>
            <NewCharacterDialog onSubmit={handleAddCharacter} />

            {loading && <p className="text-sm text-gray-400">載入中...</p>}
            {!loading && (!characters || characters.length === 0) && (
                <p className="text-sm text-gray-500">尚未新增角色</p>
            )}
            <ul className="space-y-4 mt-4">
                {characters.map((char, index) => (
                    <li
                        key={index}
                        className="p-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow duration-300 relative group"
                    >
                        {/* 頭部 - 顯示角色名稱與展開按鈕 */}
                        <div
                            className="flex justify-between items-center mb-1 cursor-pointer"
                            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                        >
                            <div className="font-bold text-gray-900 truncate max-w-[70%]">
                                {char.name || '未命名角色'}
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span>展開屬性</span>
                                <span>✏️</span>
                            </div>
                        </div>

                        {/* 展開區塊 */}
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${selectedIndex === index ? 'max-h-[800px] mt-2 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            {selectedIndex === index && (
                                <div className="space-y-3">
                                    {/* 雙欄排版：角色名稱 + 屬性 */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            className="bg-white border border-gray-300 rounded px-2 py-1 outline-none text-sm"
                                            value={char.name}
                                            placeholder="角色名稱"
                                            onChange={(e) => handleMetaChange(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    {/* 描述欄位：支援多行輸入 */}
                                    <textarea
                                        className="w-full h-24 resize-y border border-gray-300 rounded px-2 py-1 outline-none text-sm leading-relaxed"
                                        placeholder="輸入角色描述，可包含幾百字背景故事"
                                        value={char.desc}
                                        onChange={(e) => handleMetaChange(index, 'desc', e.target.value)}
                                    />

                                    {/* 屬性編輯器 */}
                                    <AttributeEditor
                                        attributes={char.attributes}
                                        onChange={(newAttrs) => handleAttrChange(index, newAttrs)}
                                    />
                                    {isSaving && (
                                        <p className="text-xs text-gray-400 animate-pulse px-1 pt-1">
                                            🕒 正在儲存...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
