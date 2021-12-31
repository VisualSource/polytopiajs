export function capitalize(value: string): string {
    return value[0].toUpperCase() + value.toLowerCase().substring(1);
}