import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, X } from 'lucide-react';

type ColorPickerProps = {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    name?: string;
    label?: string;
    error?: string;
};

// Predefined color options
const PREDEFINED_COLORS = [
    { label: 'Blue', hex: '#3b82f6', tailwind: 'bg-blue-500' },
    { label: 'Indigo', hex: '#6366f1', tailwind: 'bg-indigo-500' },
    { label: 'Purple', hex: '#8b5cf6', tailwind: 'bg-purple-500' },
    { label: 'Pink', hex: '#ec4899', tailwind: 'bg-pink-500' },
    { label: 'Red', hex: '#ef4444', tailwind: 'bg-red-500' },
    { label: 'Orange', hex: '#f97316', tailwind: 'bg-orange-500' },
    { label: 'Amber', hex: '#f59e0b', tailwind: 'bg-amber-500' },
    { label: 'Yellow', hex: '#eab308', tailwind: 'bg-yellow-500' },
    { label: 'Lime', hex: '#84cc16', tailwind: 'bg-lime-500' },
    { label: 'Green', hex: '#22c55e', tailwind: 'bg-green-500' },
    { label: 'Emerald', hex: '#10b981', tailwind: 'bg-emerald-500' },
    { label: 'Teal', hex: '#14b8a6', tailwind: 'bg-teal-500' },
    { label: 'Cyan', hex: '#06b6d4', tailwind: 'bg-cyan-500' },
    { label: 'Sky', hex: '#0ea5e9', tailwind: 'bg-sky-500' },
    { label: 'Slate', hex: '#64748b', tailwind: 'bg-slate-500' },
    { label: 'Gray', hex: '#6b7280', tailwind: 'bg-gray-500' },
];

export default function ColorPicker({
    value,
    onChange,
    id,
    name,
    label = 'Accent Color',
    error,
}: ColorPickerProps) {
    const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
    const [hexValue, setHexValue] = React.useState('');
    const [tailwindValue, setTailwindValue] = React.useState('');

    // Initialize and sync from value prop
    React.useEffect(() => {
        if (value) {
            if (value.startsWith('#')) {
                setHexValue(value);
                setTailwindValue('');
            } else if (value.startsWith('bg-')) {
                setTailwindValue(value);
                setHexValue('');
            } else {
                // Try to match with predefined colors
                const matched = PREDEFINED_COLORS.find(
                    (c) => c.hex === value || c.tailwind === value
                );
                if (matched) {
                    if (value === matched.hex) {
                        setHexValue(value);
                        setTailwindValue('');
                    } else {
                        setTailwindValue(value);
                        setHexValue('');
                    }
                }
            }
        } else {
            setHexValue('');
            setTailwindValue('');
        }
    }, [value]);

    // Add color to selected list
    const addColor = (color: string) => {
        if (color && !selectedColors.includes(color)) {
            const newColors = [color, ...selectedColors].slice(0, 5); // Keep last 5
            setSelectedColors(newColors);
            onChange(color);
        }
    };

    const removeColor = (colorToRemove: string) => {
        setSelectedColors(selectedColors.filter((c) => c !== colorToRemove));
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHexValue(val);
        if (val.match(/^#[0-9A-Fa-f]{6}$/)) {
            addColor(val);
        }
    };

    const handleTailwindChange = (val: string) => {
        setTailwindValue(val);
        if (val) {
            addColor(val);
        }
    };

    const handlePredefinedSelect = (color: { hex: string; tailwind: string }, type: 'hex' | 'tailwind') => {
        const selected = type === 'hex' ? color.hex : color.tailwind;
        if (type === 'hex') {
            setHexValue(color.hex);
        } else {
            setTailwindValue(color.tailwind);
        }
        addColor(selected);
    };

    return (
        <div className="grid gap-3">
            {label && <Label htmlFor={id}>{label}</Label>}

            <Tabs defaultValue="hex" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="hex">Hex Code</TabsTrigger>
                    <TabsTrigger value="tailwind">Tailwind Class</TabsTrigger>
                    <TabsTrigger value="preset">Preset Colors</TabsTrigger>
                </TabsList>

                <TabsContent value="hex" className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id={id}
                                name={name}
                                type="text"
                                placeholder="#3b82f6"
                                value={hexValue}
                                onChange={handleHexChange}
                                className="pl-10"
                            />
                            <div
                                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded border"
                                style={{ backgroundColor: hexValue || '#ccc' }}
                            />
                        </div>
                        <input
                            type="color"
                            value={hexValue || '#3b82f6'}
                            onChange={(e) => {
                                setHexValue(e.target.value);
                                addColor(e.target.value);
                            }}
                            className="h-10 w-16 cursor-pointer rounded border"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter hex code (e.g., #3b82f6) or use color picker
                    </p>
                </TabsContent>

                <TabsContent value="tailwind" className="space-y-3">
                    <Select value={tailwindValue} onValueChange={handleTailwindChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Tailwind class" />
                        </SelectTrigger>
                        <SelectContent>
                            {PREDEFINED_COLORS.map((color) => (
                                <SelectItem key={color.tailwind} value={color.tailwind}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-4 w-4 rounded border"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        {color.tailwind}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="text"
                        placeholder="Or type custom class (e.g., bg-blue-500)"
                        value={tailwindValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTailwindValue(val);
                            if (val) {
                                addColor(val);
                            }
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        Select from preset or enter custom Tailwind class
                    </p>
                </TabsContent>

                <TabsContent value="preset" className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        {PREDEFINED_COLORS.map((color) => (
                            <div key={color.hex} className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 p-1"
                                        onClick={() => handlePredefinedSelect(color, 'hex')}
                                        title={`Use ${color.label} hex: ${color.hex}`}
                                    >
                                        <div
                                            className="h-full w-full rounded"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 p-1"
                                        onClick={() => handlePredefinedSelect(color, 'tailwind')}
                                        title={`Use ${color.label} class: ${color.tailwind}`}
                                    >
                                        <Palette className="h-4 w-4" />
                                    </Button>
                                </div>
                                <span className="text-xs text-center text-muted-foreground">
                                    {color.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Selected Colors List */}
            {selectedColors.length > 0 && (
                <div className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Recently Used Colors</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedColors([]);
                                onChange('');
                            }}
                            className="h-6 px-2 text-xs"
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedColors.map((color) => (
                            <div
                                key={color}
                                className="group relative flex items-center gap-2 rounded-md border bg-muted px-2 py-1"
                            >
                                {color.startsWith('#') ? (
                                    <div
                                        className="h-4 w-4 rounded border"
                                        style={{ backgroundColor: color }}
                                    />
                                ) : (
                                    <div className="h-4 w-4 rounded border bg-gray-300" />
                                )}
                                <span className="text-xs font-mono">{color}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => {
                                        removeColor(color);
                                        if (value === color) {
                                            onChange('');
                                        }
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-0 opacity-0"
                                    onClick={() => onChange(color)}
                                >
                                    Use
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={value} />}

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

