var schedule = require("node-schedule");
var nodemailer = require('nodemailer');
var request = require('request');
var logger = require('./logger');
// var pomeloConnector = require('./pomeloConnector');

/**
 * 服务器列表
 * @type {*[]}
 */
var projects = [
	{name:"老中医服务器", url:"http://www.jxmlzyg.com", checkpipe:"/index.do", ipAddress:"112.74.93.203", port:8080},
	{name:"彩票主服务器", url:"", checkpipe:"/tvApp/stat.do", ipAddress:"120.26.214.68", port:8889},
	{name:"彩票备用服务器", url:"http", checkpipe:"/index.do", ipAddress:"139.196.197.254", port:8080},
	{name:"雅醇服务器", url:"http://uie.ya-chun.com", checkpipe:"/login", ipAddress:"120.26.49.63", port:80},
	{name:"奥创网页端服务器", url:"", checkpipe:"/test/login.html", ipAddress:"121.40.53.201", port:3001},
	// {name:"奥创主服务器", url:"", checkpipe:"/index.do", ipAddress:"112.74.93.203", port:8080}
];

/**
 * 邮件发送
 * @type {{host: string, port: number, secure: boolean, auth: {user: string, pass: string}}}
 */
// var smtpConfig = {
// 	host: 'smtp.qq.com',
// 	port: 465,
// 	secure: true,
// 	auth: {
// 		user: "2781017942@qq.com",
// 		pass: "fantasia"
// 	}
// };

var smtpConfig = {
	host: 'smtp.mxhichina.com',
	port: 465,
	secure: true,
	auth: {
		user: "yuanyijun@orz-tech.com",
		pass: "Qwert12345"
	}
};

var transporter = nodemailer.createTransport(smtpConfig);

/**
 * 定义规则，每分钟执行
 * @type {*|RecurrenceRule}
 */
var rule = new schedule.RecurrenceRule();
var times = [];
for (var i = 1; i < 60; i++) {
	if(i % 10 == 0) {
		times.push(i);
	}
}
rule.minute = times;

var checkServer = function(project) {
	var host = "http://" + project.ipAddress + ":" + project.port + project.checkpipe;
	request(host, function (error, response, body) {
		console.log((response == null));
		if (!error && response.statusCode == 200) {
			logger.info("尝试访问 [[" + project.name + "]] 成功");
		} else {
			var reason = '[[' + project.name + ']] 服务器无响应';
			if(response != null) {
				reason = '[[' + project.name + ']] 服务器错误, 响应代码: ' + response.statusCode;
			}
			var mailOptions = {
				from: '"OrtronMonitor" <asheryuan@126.com>',
				to: '51816080@qq.com, 46256126@qq.com, 635388554@qq.com',
				subject: '系统报警',
				text: reason,
				html: reason
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					return console.log(error);
				}
			});
		}
	});
};

schedule.scheduleJob(rule, function () {
	/**
	 * 执行访问任务，访问失败则发送邮件去通知
	 */
	if(!! projects) {
		for(var i=0; i<projects.length; i++) {
			checkServer(projects[i]);
		}
	}
});