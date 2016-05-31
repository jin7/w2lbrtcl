var storage = localStorage;

/******************************************************************
 * 定数
 ******************************************************************/
var kHandicap  = "compe.handicap";
var kHandyHole = "compe.handiHole";
var kRId       = "compe.rid";
var kRName     = "compe.rname";
var kCName     = "compe.cname";
var kCHoleInfs = "compe.holeinfs";
var kPlayers   = "compe.players";
var kScores    = "compe.scores";
var kTeams     = "compe.teams";
var kHandiMax  = "compe.handiMax";

var ns = ["leadersboard","live"];
var ev = ["connect", "uploadscore", "getroundinf", "score", "personalscore", "comment"];

// チームスコアデータ
function dataTeamScore () {
    this.dataId = 0;		// チーム固有のID。HTMLオブジェクトのIDとして利用
    this.ranking = 0;		// 順位（表示用）
    this.name = "";			// チーム名
    this.score_gross = 0;	// グロスのスコア
    this.handicap = 0;		// ハンディキャップ
    this.score_net = 0;		// ネットのスコア
    this.count = 0;			// チーム人数
    this.age = 0; 			// 誕生経過日数
}

// 個人スコアデータ
function dataPlayerScore () {
    this.dataId = 0;		// プレイヤー固有のID。HTMLオブジェクトのIDとして利用
    this.ranking = 0;		// 順位（表示用）
    this.name = "";			// プレイヤー名
//	this.hole1_id = "";		// ホール1のコースID
//	this.hole1_score = "";	// ホール1のスコア
//	this.hole2_id = "";		// ホール2のコースID
//	this.hole2_score = "";	// ホール2のスコア
    this.hole_score = "";	// ホールのスコア
    this.score_gross = 0;	// グロスのスコア
    this.handicap = 0;		// ハンディキャップ
    this.score_net = 0;		// ネットのスコア
    this.teamId = 0; 		// チームID
    this.age = 0; 			// 誕生経過日数
}

// leadersboard接続
io.transports.push('websocket');
io.transports.push('xhr-polling');
io.transports.push('jsonp-polling');
io.transports.push('flashsocket');
io.transports.push('htmlfile');

var lb = io.connect("https://w2lb.herokuapp.com/leadersboard", {
    'try multiple transports': true,
    'force new connection': true
});
console.log("leadersboard attempt connect...");

// 接続成功
lb.on(ev[0], function() {
    console.log("connect success...");
    
    // ラウンド情報取得
    lb.on(ev[2], function(round) {
        console.log("getroundinf access...");
        getRoundData([round]);
        getPlayerData([round]);

        if (storage.getItem("_" + kRId) != null
          && storage.getItem("_" + kRId) != ""
          && storage.getItem("_" + kRId) != "undefined")
        {
            lb.on(ev[4], function(score) {
                getScoreData(score);
                setTeamScoreData();
            });

            // スコア要求
            requestPersonalScore(lb, storage.getItem("_" + kRId), 2);
        }
    });
});

// 接続失敗
lb.on('connect_failed', function(data){
    console.log("leadersboard connection faled " + data);
    alert("Connection Error!" + data);
    return;
});

/******************************************************************
 * ラウンド情報要求
 ******************************************************************/
function requestRoundInfo( rid ) {
	lb.emit(ev[2], { 'rid' : rid });
	console.log("send request RoundInfo(" + rid + ")");
}

/******************************************************************
 * ラウンド情報の取得
 ******************************************************************/
function getRoundData( roundData ) {
	// ラウンドID
	storage.setItem("_" + kRId, roundData[0].rid);

	// ラウンド名
	storage.setItem("_" + kRName, roundData[0].rname);

	// ハンディキャップ方式
	storage.setItem("_" + kHandicap, JSON.stringify(roundData[0].handicapinf));

	// コース名
	storage.setItem("_" + kCName, roundData[0].cinf.cname);

	// コース情報
	var arraySubCourses = [];
	for (var i = 0; i < roundData[0].cinf.holeinfs.length; i++)
	{
		arraySubCourses[i] = roundData[0].cinf.holeinfs[i];
	}
	storage.setItem("_" + kCHoleInfs, JSON.stringify(arraySubCourses));

	// ハンデ選択数
	var h = 6;
/*		if (JSON.parse(storage.getItem(kHandicap)).method == 1) {
		h = 4;
	} else if (JSON.parse(storage.getItem(kHandicap)).method == 2) {
		h = 6;
	} else if (JSON.parse(storage.getItem(kHandicap)).method == 3) {
		h = 8;
	}
*/
	storage.setItem("_" + kHandiMax, h * JSON.parse(storage.getItem("_" + kCHoleInfs)).length);
    console.log("got roundData");
}

/******************************************************************
 * プレイヤー情報/チーム情報の取得（初回接続時）
 ******************************************************************/
function getPlayerData( roundData ) {
	var arrayPlayers = [];
	var arrayTeams = [];
	var k = 0;
	var l = 0;

	var plobj = new Array();
	for (var i = 0; i < roundData[0].prtyinfs.length; i++)
	{
		for (var j = 0; j < roundData[0].prtyinfs[i].plyrifs.length; j++)
		{
			// プレイヤー情報
			plobj[k] = roundData[0].prtyinfs[i].plyrifs[j];

			// プレイヤーキー一覧
			arrayPlayers[k] = roundData[0].prtyinfs[i].plyrifs[j].plid;
			k++;

			// チームキー一覧
			if (arrayTeams.indexOf(roundData[0].prtyinfs[i].plyrifs[j].tid) == -1)
			{
				arrayTeams[l] = roundData[0].prtyinfs[i].plyrifs[j].tid;
				l++;
			}
		}
	}

	storage.setItem("_" + kPlayers, JSON.stringify(plobj));
    console.log("get playerData");
}

/******************************************************************
 * スコア要求（初回接続時　サーバへの送信）
 ******************************************************************/
function requestPersonalScore( lb, rid, type ) {
	lb.emit(ev[4], { "rid": rid, "type": type });
	console.log("send requestPersonalScore rid:" + rid + ",type:" + type);
}

/******************************************************************
 * スコア情報取得処理（初回接続時）
 ******************************************************************/
function getScoreData( scoreData )
{
	// 各プレイヤースコア
	for (var i = 0; i < scoreData.pscores.length; i++)
	{
		storage.setItem("_" + scoreData.pscores[i].plid + ".scr", JSON.stringify(scoreData.pscores[i].score));
	}
    console.log("got ScoreData");
}

/******************************************************************
 * スコア情報取得処理（初回接続時）
 ******************************************************************/
function setTeamScoreData()
{
	var dataPlayerScores = new Array();
	var dataTeamScores = new Array();

	// 各プレイヤー情報から値を加算していく
	var plObj = JSON.parse(storage.getItem("_" + kPlayers));
	for (var i = 0; i < plObj.length; i++)
	{
		var tid = plObj[i].tid;
		var tname = plObj[i].team.tname;
		var scr = JSON.parse(storage.getItem("_" + plObj[i].plid + ".scr"));
		if (scr == null) continue;

		var plScr = new dataPlayerScore();
		plScr.dataId = plObj[i].plid;
		plScr.name = plObj[i].user.uname;
		plScr.hole_score = scr.holes;
		plScr.score_gross = scr.gross;
		plScr.score_net = scr.gross;
		plScr.teamId = tid;
		plScr.age = getCulculateAge(plObj[i].user.brthdy);
		dataPlayerScores.push(plScr);

		// 成績表示用のチーム情報に加算する
		var flg = false;
		var cnt = dataTeamScores.length;
		for (var j = 0; j < cnt; j++)
		{
			if (dataTeamScores[j].dataId == tid)
			{
				// 既にチームが登録されている
				dataTeamScores[j].score_gross += scr.gross;
				dataTeamScores[j].count += 1;
				// 年齢の加算
				dataTeamScores[j].age += getCulculateAge(plObj[i].user.brthdy);
				flg = true;
				break;
			}
		}

		// チームが未登録
		if (!flg)
		{
			dataTeamScores[cnt] = new dataTeamScore();
			dataTeamScores[cnt].dataId = tid;
			dataTeamScores[cnt].name = tname;
			dataTeamScores[cnt].score_gross = scr.gross;
			dataTeamScores[cnt].count = 1;
			dataTeamScores[cnt].age = getCulculateAge(plObj[i].user.brthdy);
		}

		// 不要になったstorageを削除
		storage.removeItem("_" + plObj[i].plid + ".scr");
	}

	// 全プレイヤーの集計が終わったので、スコアを人数割りする
	for (var i = 0; i < dataTeamScores.length; i++)
	{
		dataTeamScores[i].score_gross = Math.round(dataTeamScores[i].score_gross * 10 / dataTeamScores[i].count) / 10;
		dataTeamScores[i].score_net = Math.round(dataTeamScores[i].score_gross * 10) /10;
		dataTeamScores[i].age = Math.round(dataTeamScores[i].age / dataTeamScores[i].count);
	}

	storage.setItem("_" + kScores, JSON.stringify(dataPlayerScores));
	storage.setItem("_" + kTeams, JSON.stringify(dataTeamScores));
    
    console.log("got TeamScoreData");
}

/******************************************************************
 * 年齢（経過日数）取得
 *   yyyy-MM-ddThh:mm:ss.sssZから現在年齢（経過日数）を求める
 ******************************************************************/
function getCulculateAge(birthday)
{
	// yyyy-MM-ddのみ取得
	var birth = birthday.substr(0,10).split('-');
	var _birth = new Date(parseInt(birth[0]), parseInt(birth[1]-1),  parseInt(birth[2]));
	var today = new Date();

	return (Math.floor( (today.getTime() - _birth.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

