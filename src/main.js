addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const { method } = request;
    const { pathname } = new URL(request.url);
    const key = pathname.substr( 1, pathname.length );
    switch ( method ) {
        case 'GET':
            return response( await show(key) )
            break;
        case 'POST':
            const { description, cookies } = await request.json()
            return response( await create({ description, cookies }) )
            break;
        case 'DELETE':
            return response( destroy( key ) )
        default:
            return response({ message: "error" })
            break;
    }

}

function random( length = 16 ){
    return Math.random().toString(16).substr(2, length);
}

async function keyExists( key ) {
    return await OREOKV.get( key, { cacheTtl: 3600 } ) ? true : false;
}

function response( data ) {
    return new Response( JSON.stringify(data), {
        headers: { "content-type": "application/json" }
    })
}

async function create( data ) {
    
    const key = random(16)

    await OREOKV.put(key, JSON.stringify(data), {
        expirationTtl: 604800
    });

    return { key, ...data };

}

async function show( key ) {
    return await OREOKV.get( key, { type: "json", cacheTtl: 3600 } )
}

async function destroy( key ) {
    return await OREOKV.delete( key )
}