/* eslint-disable no-param-reassign */
import { listenClickOnBtn, removeClassListForElements } from '../../utils/general-functions';

class AudioCard {
  private playAllAudio(id: string): void {
    this.stopAudio();
    const ListenedBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-audio[data-id="${id}"]`));
    ListenedBtn.classList.add('active');
    const audio = <HTMLAudioElement>(document.querySelector(`.book__audio-word[data-audio-word="${id}"]`));
    audio.play();
    audio.addEventListener('ended', (): void => {
      this.playMeaningAudio(id);
    });
  }

  private playMeaningAudio(id: string): void {
    const audio = <HTMLAudioElement>(document.querySelector(`.book__audio-meaning[data-audio-meaning="${id}"]`));
    audio.play();
    audio.addEventListener('ended', (): void => {
      this.playExampleAudio(id);
    });
  }

  private playExampleAudio(id: string): void {
    const audio = <HTMLAudioElement>(document.querySelector(`.book__audio-example[data-audio-example="${id}"]`));
    audio.play();
    audio.addEventListener('ended', (): void => {
      const ListenBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-audio[data-id="${id}"]`));
      ListenBtn.classList.remove('active');
    });
  }

  private stopAudio(): void {
    removeClassListForElements('book__btn-audio', 'active');
    const audioElements = <NodeListOf<HTMLAudioElement>>document.querySelectorAll('.book__audio');
    audioElements.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
  }

  private playAudioCard(event: MouseEvent): void {
    const targ = <HTMLButtonElement>event.target;
    if (
      (targ.classList.contains('book__btn-audio') && !targ.classList.contains('active'))
      || (targ.parentElement?.classList.contains('book__btn-audio') && !targ.parentElement?.classList.contains('active'))
    ) {
      const id = <string>targ.getAttribute('data-id');
      this.playAllAudio(id);
    } else if (targ.classList.contains('book__btn-audio') || targ.parentElement?.classList.contains('book__btn-audio')) {
      this.stopAudio();
    }
  }

  private addListenerForAudioCards(event: MouseEvent): void {
    this.playAudioCard(event);
  }

  listenClickOnListenBtn(): void {
    listenClickOnBtn('book-page__wrap-card', this.addListenerForAudioCards.bind(this));
  }
}

export default AudioCard;
