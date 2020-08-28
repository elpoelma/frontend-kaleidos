import TextArea from '@ember/component/text-area';

export default TextArea.extend({
  didRender() {
    this.$().keypress((event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    });
  },
});
