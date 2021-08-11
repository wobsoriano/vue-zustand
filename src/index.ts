import { Ref, ref } from 'vue-demi';

function isClipboardApiSupported (navigator: Navigator) {
    return typeof navigator === 'object' && typeof navigator.clipboard === 'object';
}

function createTextArea () {
    const textArea = document.createElement('textarea');
    
    // Hide textarea element
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    return textArea;
}

function removeElement(element: HTMLElement) {
    element.parentNode!.removeChild(element);
};

function fallbackCopyTextToClipboard(text: string) {
    const textArea = createTextArea();
    textArea.value = text;
    textArea.focus();
    textArea.select();
  
    const success = document.execCommand('copy');
    removeElement(textArea);

    if (!success) {
        throw new Error('Unable to copy.');
    }
}

async function copyTextToClipboard(text: string) {
    if (!isClipboardApiSupported(navigator)) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
    } catch (_err) {
        throw new Error('Permission not allowed.');
    }
}

export default function useClipboard(): [
    Ref<string>,
    (text: string) => Promise<void>
] {
    const clipboard = ref('');

    const setClipboard = async (text: string) => {
        try {
            await copyTextToClipboard(text);
            clipboard.value = text;
        } catch (err) {
            clipboard.value = '';
            throw new Error(err);
        }
    }

    return [clipboard, setClipboard];
}
