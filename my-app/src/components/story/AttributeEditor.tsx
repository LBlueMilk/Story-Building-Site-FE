'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
    attributes: Record<string, string>;
    onChange: (newAttributes: Record<string, string>) => void;
}

export default function AttributeEditor({ attributes, onChange }: Props) {
    const [localAttrs, setLocalAttrs] = useState<[string, string][]>([]);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setLocalAttrs(Object.entries(attributes));
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const obj = Object.fromEntries(
            localAttrs.filter(([key]) => key.trim() !== '')
        );
        onChange(obj);
    }, [localAttrs]);

    const updateAndNotify = (updated: [string, string][]) => {
        setLocalAttrs(updated);
    };

    const handleKeyChange = (index: number, newKey: string) => {
        const updated = [...localAttrs];
        updated[index][0] = newKey;
        updateAndNotify(updated);
    };

    const handleValueChange = (index: number, newValue: string) => {
        const updated = [...localAttrs];
        updated[index][1] = newValue;
        updateAndNotify(updated);
    };

    const handleDelete = (index: number) => {
        const updated = [...localAttrs];
        updated.splice(index, 1);
        updateAndNotify(updated);
    };

    const handleAdd = () => {
        const updated = [...localAttrs, ['', ''] as [string, string]];
        updateAndNotify(updated);
    };

    return (
        <div className="space-y-2">
            {localAttrs.map(([key, value], index) => (
                <div key={index} className="flex gap-2 items-center">
                    <Input
                        placeholder="屬性名稱"
                        value={key}
                        onChange={(e) => handleKeyChange(index, e.target.value)}
                        className="w-1/3"
                    />
                    <Input
                        placeholder="屬性內容"
                        value={value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="flex-1"
                    />
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                        刪除
                    </Button>
                </div>
            ))}
            <Button onClick={handleAdd} variant="outline" className="w-full">
                ➕ 新增屬性
            </Button>
        </div>
    );
}