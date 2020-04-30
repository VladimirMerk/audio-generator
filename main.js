/*
 Материалы
 https://marcgg.com/blog/2016/11/01/javascript-audio/
 https://tuhub.ru/posts/vvedenie-v-web-audio-api

 Частоты музыкальных нот от C0 до B8 находятся в диапазоне 16.35 до 7902.13Гц.
 440, это нота A4
 Create audio context -> Create source -> Create filter nodes -> Connect to destination
 */

{
  document.addEventListener('click', play);

  const context = new (window.AudioContext || window.webkitAudioContext)();
  let currentOscilator = null;
  let gainNode = null;
  function play({ target } = {}) {
    const fieldset = target.closest('fieldset');
    switch (target.name) {
      case 'play':
        if (!fieldset) return;
        switch (fieldset.name) {
          case 'sine':
            if (currentOscilator) return;
            currentOscilator = context.createOscillator();
            // oscilator -> destination
            currentOscilator.type = 'sine';
            currentOscilator.frequency.value = 440;
            currentOscilator.connect(context.destination);
            currentOscilator.start();
            break;
          case 'gain':
            if (currentOscilator) return;
            currentOscilator = context.createOscillator();
            // oscilator -> gain -> destination
            /**
             * Gain - включаем в цепочку усилитель который позволит регулировать
             * уровень громкости
             */
            gainNode = context.createGain();
            currentOscilator.connect(gainNode);
            gainNode.connect(context.destination);
            currentOscilator.start(0);
            break;
          case 'blump':
            {
              const oscilator = context.createOscillator();
              oscilator.type = target.dataset.type;
              gain = context.createGain();
              oscilator.connect(gain);
              gain.connect(context.destination);
              oscilator.start(0);
              gain.gain.exponentialRampToValueAtTime(
                0.00001,
                context.currentTime + 1.04
              );
              oscilator.stop(context.currentTime + 1.04);
            }
            break;
          case 'notes':
            {
              const oscilator = context.createOscillator();
              oscilator.type = fieldset.querySelector('input[type=radio]:checked').value;
              oscilator.frequency.value = target.dataset.frequency;
              gain = context.createGain();
              oscilator.connect(gain);
              gain.connect(context.destination);
              oscilator.start(0);
              gain.gain.exponentialRampToValueAtTime(
                0.00001,
                context.currentTime + 1.04
              );
              oscilator.stop(context.currentTime + 1.04);
            }
            break;
          default:
            break;
        }
        break;
      case 'stop':
        console.log('context.currentTime', context.currentTime);
        if (!currentOscilator) return;
        switch (fieldset.name) {
          case 'gain':
            if (!gainNode) return;
            // Уменьшаем громкость до 0.00001 в течении 1.04 сек
            gainNode.gain.exponentialRampToValueAtTime(
              0.00001,
              context.currentTime + 1.04
            );
            // Через 1.04 сек останавливаем осцилятор
            currentOscilator.stop(context.currentTime + 1.04);
            currentOscilator.onended = () => currentOscilator = null;
            break;
          default:
            currentOscilator.stop();
            currentOscilator = null;
            break;
        }
        break;
    }
  }
}
