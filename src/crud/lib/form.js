import { renderForm, deepMerge, renderLayout, certainProperty, dataset } from '@/utils';
import { DialogMixin } from '@/mixins/dialog';
import '../assets/css/index.styl';

export default {
  name: 'cl-form',
  mixins: [DialogMixin],

  props: {
    options: Object
  },

  data() {
    return {
      items: [],
      op: {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        layout: ['cancel', 'confirm']
      },
      props: {
        size: 'small',
        'append-to-body': true,
        'close-on-click-modal': false,
        'destroy-on-close': true,
        drag: true
      },
      form: {},
      on: {},
      fn: {},
      saving: false,
      loading: false,
      visible: false,
      'v-loading': {
        'element-loading-text': '',
        'element-loading-spinner': '',
        'element-loading-background': ''
      }
    };
  },

  methods: {
    open(options) {
      if (!options) {
        return console.warn(`can't open form, because argument is null`);
      }

      const { props, items, on, op, ['v-loading']: vLoading } = options;

      this.visible = true;

      if (vLoading) {
        this['v-loading'] = vLoading;
      }

      if (items) {
        this.items = items;
      }

      if (!props.top) {
        props.top = '15vh';
      }

      if (!props.width) {
        props.width = '50%';
      }

      this.dialog.fullscreen = props.fullscreen;

      if (props) {
        deepMerge(this.props, props);
      }

      if (on) {
        this.on = on;
      }

      if (op) {
        deepMerge(this.op, op);
      }

      // 改变指向
      // this.form = {};

      this.items.forEach(e => {
        this.$set(this.form, e.prop, e.value);
      });

      return this.cb();
    },

    done() {
      this.saving = false;
    },

    showLoading(text) {
      this['v-loading']['element-loading-text'] = text;
      this.loading = true;
    },

    hideLoading() {
      this.loading = false;
    },

    data(p) {
      return dataset(certainProperty(this, ['items']), p);
    },

    setData(p, d) {
      deepMerge(this, dataset(certainProperty(this, ['items']), p, d));
    },

    cb() {
      return {
        data: this.form,
        ...certainProperty(this, [
          'done',
          'items',
          'save',
          'close',
          'showLoading',
          'hideLoading',
          'setData',
          'data'
        ])
      };
    },

    close() {
      this.$refs['form'].resetFields();
      this.visible = false;
      this.saving = false;

      if (this.on.close) {
        this.on.close();
      }
    },

    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.on.submit) {
            this.saving = true;

            this.on.submit(this.cb());
          } else {
            console.warn('Submit is not found');
          }
        }
      });
    }
  },

  render() {
    const form = renderForm.call(this);
    const titleEl = this.renderTitleSlot();
    const { confirmButtonText, cancelButtonText, layout } = this.op;

    return (
      this.visible && (
        <el-dialog
          visible={this.visible}
          {...{
            props: this.props,

            on: {
              open: this.open,
              close: this.close
            },

            directives: [
              {
                name: 'dialog-drag',
                value: certainProperty(this, ['props', 'dialog'])
              }
            ]
          }}>
          {form}
          <template slot="title">{titleEl}</template>
          <template slot="footer">
            {layout.map(vnode => {
              if (vnode == 'confirm') {
                return (
                  <el-button
                    size={this.props.size}
                    type="success"
                    {...{
                      on: {
                        click: this.save
                      },

                      props: {
                        loading: this.saving,
                        disabled: this.loading
                      }
                    }}>
                    {confirmButtonText}
                  </el-button>
                );
              } else if (vnode == 'cancel') {
                return (
                  <el-button size={this.props.size} on-click={this.close}>
                    {cancelButtonText}
                  </el-button>
                );
              } else {
                return renderLayout.call(this, vnode);
              }
            })}
          </template>
        </el-dialog>
      )
    );
  }
};
