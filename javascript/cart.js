
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'llaurrrraa-hexschool';

// 宣告 vee validate 會用到的工具
// Form, Field, ErrorMessage 為元件。defineRule, configure 為函式，用來定義規則及設定
// 第二行為定義規則的時候會需要的 rules
// 第三行為多國語系
// 分成不同的物件在使用解構的方式引入 !
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

// 載入中文驗證
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');
// 使用上方語系檔案
configure({ // 用來做一些設定
    generateMessage: localize('zh_TW'), //啟用 locale 
  });

const app = Vue.createApp({
    data(){
        return{
            products:[],
            productId:'',
            cartData:{
                carts:''
            },
            isLoadingItem:'',
            user:{
                email:'',
                name:'',
                tel:'',
            },
        }
    },
    components:{
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    methods:{
        // 取得產品
        getProducts(){
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then( res => {
                    this.products = res.data.products;
                    // console.log(this.products);
                })
        },
        openProductModal(id){
            this.productId = id;
            this.$refs.productModal.openModal();
        },
        getCart(){
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then( res => {
                    this.cartData = res.data.data;
                    // console.log(this.cartData);
                })
        },
        addToCart(id,qty = 1){
            const data = {
                product_id: id,
                qty: qty,
            };
            this.isLoadingItem = id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`,{ data })
                .then( res => {
                    this.cartData = res.data.data;
                    this.getCart();
                    this.isLoadingItem = '';
                    this.$refs.productModal.closeModal();
                })
        },
        removeCartItem(id){
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
                .then( res => {
                    this.getCart();
                    this.isLoadingItem = '';
                })
        },
        updateToCart(cart){
            const data = {
                product_id: cart.id,
                qty: cart.qty,
            };
            this.isLoadingItem = cart.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${cart.id}`,{ data })
                .then( res => {
                    // console.log(res);
                    this.getCart();
                    this.isLoadingItem = '';
                })
        },
        isPhone(telNumber){
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(telNumber) ? true : '請輸入正確的電話號碼'
        },
        clearCartAll(){
            axios.delete(`${apiUrl}/api/${apiPath}/carts/`)
                .then( res => {
                    this.getCart();
                })
        }
    },
    mounted(){
        this.getProducts();
        this.getCart();
    }
})

app.component('product-modal',{
    props:['id'],
    data(){
        return{
            myModal:{},
            product:{},
            qty:1,
        }
    },
    template:'#userProductModal',
    watch:{
        id(){
            this.getThisProduct();
            // console.log(this.id);
        }
    },
    methods:{
        openModal(){
            this.myModal.show();
        },
        closeModal(){
            this.myModal.hide();
        },
        getThisProduct(){
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then( res => {
                    this.product = res.data.product;
                    // console.log(this.product);
                })
        },
        addToCart(){
            this.$emit('add-to-cart',this.product.id, this.qty);
            // this.closeModal();
        }
    },
    mounted(){
        this.myModal = new bootstrap.Modal(this.$refs.myModal);
    }
})

app.mount('#app');