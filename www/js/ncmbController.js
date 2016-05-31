// ncmbController.js

var ncmbController = {
    APPLICATION_KEY: "42c162d547749a093652b567136cc365e9d3f012d9287e84ae6081369607f634",
    CLIENT_KEY: "dbd61adf008ecf519984328560753b606dcf707083feca7cf10dc13afacc78f5",
    
    ncmb: null,
    currentUser: null,  // ログイン済ユーザーのオブジェクトを格納
    
    // 初期化
    init: function() {
        var self = this;
        self.ncmb = new NCMB(self.APPLICATION_KEY, self.CLIENT_KEY);  // mobile backendの初期化
        
    },
    
    // ユーザー登録
    signup: function() {
        var self = this;
        
        // メールアドレス入力
        
        
        // メールアドレスによる会員登録
        self.ncmb.User.requestSignUpEmail(mailAddress)
            .then(function(data) {
                // 送信後処理
                // TODO:メール確認してね！メッセージ表示
                alert('ユーザー登録を行うためのメールを送信しました。メールに書かれているURLにアクセスし登録を完了してください。');
            })
            .catch (function(err) {
                // エラー処理
                // TODO:エラーメッセージ表示
                alert('既に登録されている可能性があります');
            });
    },
    
    // ログイン
    login: function() {
        var self = this;
        var mailAddress = localStorage.getItem("mailAddress");

        if (!mailAddress) {
            // アカウントを作成したことがない
            self.signup();
        }
        self.ncmb.loginWithMailAddress(maiAddress, password)
            .then(function(data) {
                // ログイン後処理
            })
            .catch(function(err) {
                // エラー処理
            });
    },
};

