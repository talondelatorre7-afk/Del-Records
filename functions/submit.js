export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const data = Object.fromEntries(formData);
        
        // We will activate the webhook routing after they sign the retainer
        
        return Response.redirect(new URL('/success', context.request.url), 303);
    } catch (error) {
        return new Response("There was an error submitting the form.", { status: 400 });
    }
}