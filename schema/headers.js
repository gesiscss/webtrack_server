module.exports = {

    headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
            authorization: {
                type: 'string'
            }
        }
      }

}
