const axios = require('axios');

async function downloadWhatsAppMedia(
    mediaId
) {

    try {

        // =========================
        // GET MEDIA URL
        // =========================

        const mediaResponse =
            await axios.get(

`https://graph.facebook.com/v23.0/${mediaId}`,

                {
                    headers: {

                        Authorization:
`Bearer ${process.env.META_ACCESS_TOKEN}`
                    }
                }
            );

        const mediaUrl =
            mediaResponse.data.url;

        // =========================
        // DOWNLOAD IMAGE
        // =========================

        const imageResponse =
            await axios.get(
                mediaUrl,
                {

                    responseType:
                        'arraybuffer',

                    headers: {

                        Authorization:
`Bearer ${process.env.META_ACCESS_TOKEN}`
                    }
                }
            );

        // convert to base64

        const base64Image =
            Buffer.from(
                imageResponse.data,
                'binary'
            ).toString('base64');

        return base64Image;

    } catch (error) {

        console.log(
            '❌ MEDIA DOWNLOAD ERROR'
        );

        console.log(error);

        return null;
    }
}

module.exports = {
    downloadWhatsAppMedia
};