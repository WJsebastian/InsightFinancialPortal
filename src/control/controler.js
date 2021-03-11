const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const { request } = require('http')
const router = new Router()
const dao = require('../sql/dao')
const User = require('../bean/user')
const Send_Mail = require('../mail/Mail')
const { get_Random_Code } = require('../util/get_Random_Code')
const { COPYFILE_EXCL } = require('constants')
// const session = require('koa-session')
router.post('/SignIn', async (ctx) => {
    if (ctx.cookies.get('signedin') == 'true') {
        ctx.body = { code: '203', url: '/' }
        return
    }
    // console.log('Hi')
    let postData = await parsePostData(ctx)
    var name = postData.name
    var password = postData.password
    // console.log('get:'+name+','+password)
    await dao.Retrive(name, (user) => {
        // console.log('3')
        // console.log(user.get_password())
        if (user != null && user.get_password() == password) {
            // console.log('success!')
            ctx.body = { code: '200', url: '/' }
            ctx.cookies.set('signedin', 'true', { maxAge: 7200000 })
        }
        else {
            ctx.body = { code: '201', url: '/' }
        }
        // console.log('1'+ctx)
    })
    // console.log('2'+ctx)
})
router.post('/SignUp', async (ctx) => {
    // console.log(ctx.session)
    let postData = await parsePostData(ctx)
    var email = postData.email
    var password = postData.password
    var varification_code = postData.varification_code
    if(ctx.session.varification_code==''){
        ctx.body = {code : '201'}
        return
    }
    // varification_code
    // console.log(ctx.session.varification_code)
    // console.log(varification_code)
    await dao.Retrive(email, (user) => {
        if (user != null) {
            ctx.body = { code: '203' }
            // console.log(ctx.body.code)
        }
    })
    if (ctx.body !=null && ctx.body.code == '203') {
        return
    }
    if (ctx.session.varification_code == null) {
        ctx.body = { code: '300' }
        return
    }
    // ctx.session.varification_code
    if (!(varification_code == ctx.session.varification_code)) {
        ctx.body = { code: '400' }
        return
    }
    
    var user =new User(null, email, password, 0, '', null, false)
    await dao.Add_User(user, (flag) => {
        if (flag) { ctx.body = { code: '200', url: '/' } }
        else { ctx.body = { code: '301', url: '/' } }
    })

})
router.get('/getTickers', async (ctx) => {
    let company = ctx.query.company
    const host = 'http://3.83.182.118'
    const path = '/' + company + '.csv'
    csv_file = request(host + path)
})
router.post('/AdmainLogin', async (ctx) => {
    let postData = await parsePostData(ctx)
    var account = postData.name
    var password = postData.password
    if (account == 'ivyonline_admain' && password == 'cornellab_2019') {
        // ctx.res.setHeader('Set-Cookie','account=ivyonline_admain;password=cornellab_2019')
        ctx.body = { code: '200', url: '/admain_page' }
    }
    else {
        ctx.body = { code: '202' }
    }
})
router.get('/getVerifivationCode', async (ctx) => {
    let email = ctx.query.email
    let code = await get_Random_Code(100000, 1000000)

    var flag = await Send_Mail(code, email)

    if (flag) {
        ctx.body = { code: '200' }
        // console.log(code.toString())
        ctx.session.varification_code = code.toString()
        // console.log(ctx.session.varification_code)
        // console.log(ctx.session.varification_code)
    }
    else { ctx.body = { code: '301' } }

})
function parsePostData(ctx) {
    return new Promise((resolve, reject) => {
        try {
            // console.log(ctx.req === ctx.request)
            let postData = '';
            ctx.req.addListener('data', (data) => {
                postData += data;
            })
            ctx.req.addListener('end', () => {
                let parseData = parseQueryStr(postData);
                resolve(parseData)
            })
        } catch (err) {
            reject(err)
        }
    })
}
function parseQueryStr(queryStr) {
    // console.log('queryStr',queryStr)
    let queryData = {};
    let queryStrList = queryStr.split('&');
    //   console.log(queryStrList);
    for (let [index, queryStr] of queryStrList.entries()) {
        //   console.log(index,queryStr)
        let itemList = queryStr.split('=');
        queryData[itemList[0]] = decodeURIComponent(itemList[1]);
    }
    return queryData
}
module.exports = router