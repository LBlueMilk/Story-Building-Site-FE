// src/services/character.client.ts
import axios from '@/services/api';

export interface Character {
    name: string;
    desc: string;
    attributes: Record<string, any>;
    relations: {
        target: string;
        type: string;
    }[];
}

export interface CharacterDataResponse {
    characters: Character[];
}

// 取得角色清單
export async function getCharacters(storyId: number): Promise<{ characters: Character[] }> {
    const res = await axios.get<{ json: { characters: Character[] } }>(`/character/${storyId}`);
    const characters = res.data?.json?.characters ?? [];
    return { characters };
  }

// 儲存角色清單
export async function saveCharacters(
    storyId: number,
    payload: { characters: Character[] },
): Promise<{ message: string }> {
    const res = await axios.post<{ message: string }>(`/character/${storyId}`, {
        json: payload, // 外層包 json
    });
    return res.data;
}
