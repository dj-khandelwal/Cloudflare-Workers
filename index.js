const variantListHost = 'https://cfw-takehome.developers.workers.dev/api/variants'
const cookieVar = 'variant'
const replacedURL = 'https://www.linkedin.com/in/djkhandelwal/'

/**
 * The Element Handler class that defines the transformation
 * behavior for each tag that we transform.
 */
class ElementHandler {
 
  element(element) {
    switch (element.tagName) {
      case 'p':
        element.setInnerContent("A genuine thanks to Cloudflare for setting this up and doing this. It's been a pleasure learning about Cloudflare's offerings!")
        element.after("Please check out my LinkedIn profile below!")
        break;
      case 'h1':
        element.prepend("Dheeraj Khandelwal | With Cookies & HTMLWriter | This is: ")
        break;
      case 'title':
        element.setInnerContent("Cloudflare's Intern Takehome Challenge - Dheeraj Khandelwal")
        break;
      case 'a':
        element.setInnerContent("Click here for Dheeraj's LinkedIn")
        element.setAttribute('href', replacedURL)
        break;
      default:
        console.log("ERROR");
        break;
    }
  }
}

/**
 * The HTML ReWriter object.
 */
const rewriter = new HTMLRewriter()
  .on('a#url', new ElementHandler())
  .on('h1#title', new ElementHandler())
  .on('p#description', new ElementHandler())
  .on('title', new ElementHandler())

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * Event Listener listening for FetchEvent
 * @param {FetchEvent} fetch
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let varList = await fetchVariantList(variantListHost)
  const cookie = getCookie(request, cookieVar)
  let i;
  if (cookie) {
    // We have a valid cookie, hence we already know which indice to refer to.
    i = cookie
  } else {
    // Gives us either 0 or 1 after random generation
    // Use these as the indices to the list of URLs
    i = getRandomInt()
  }

  let respBody = await fetchGetVariant(varList[i])
 
  let body = await respBody
  body = await rewriter.transform(body)
  respCookie = new Response(body.body, body)
  // Store the indice of the used URL as a cookie that can be retrieved later.
  respCookie.headers.set('Set-Cookie', cookieVar+'='+i)
  body = await respCookie.text()
  return new Response(body, {
    status: respCookie.status,
    statusText: respCookie.statusText,
    headers: respCookie.headers
  })
}
/**
 * fetchVariantList sends a GET request 
 * and reads in the response body. Use await fetchVariantList(..)
 * in an async function to get the response body
 * @param {string} host the URL to send the request to
 */
async function fetchVariantList(host) {
  const init = {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }

  const response = await fetch(host, init)
  const body = await response.json()
  const list = body.variants
  return list
}

/**
 * fetchGetVariant sends a GET request 
 * and reads in the response body. Use await fetchGetVariant(..)
 * in an async function to get the response body that will get 
 * the response HTML template from the below URL
 * @param {string} varURL the URL to send the request to
 */
async function fetchGetVariant(varURL) {
  const init = {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }

  const response = await fetch(varURL, init)
  return response
}

/**
 * A simple random number generator. Generates number 
 * 0 or 1 to allow us to select one of the indices from the
 * two options that we have in the list.
 */
function getRandomInt() {
  return Math.random() < 0.5 ? 0 : 1
}