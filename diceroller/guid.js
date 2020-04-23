export function GenerateGuid()
{
    var sGuid = "";
    for (var i = 0; i< 32; i++)
    {
        sGuid += Math.floor(Math.random() * 0xF).toString(0xF);
    }
    return sGuid;
}