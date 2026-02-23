#version 450

layout(location = 0) in vec3 FragmentWorldPosistion;
layout(location = 1) in vec3 FragmentNormal;
layout(location = 2) in vec2 FragmentTextureCoordinate;

layout(binding = 0) uniform uniform_buffer
{
    mat4 ModelMatrix;
    mat4 ViewMatrix;
    mat4 ProjectionMatrix;
    vec4 LightPosition;
    vec4 LightColor;
    vec4 CameraPosition;
} UniformBuffer;

layout(binding = 1) uniform sampler2D TextureSampler;

layout(location = 0) out vec4 OutColor;

//NOTE(Lyubomir): Smooth noise for lantern flicker
float Hash(float N) {
    return fract(sin(N) * 43758.5453);
}
float Noise(float X)
{
    float I = floor(X);
    float F = fract(X);
    F = F * F * (3.0 - 2.0 * F);
    return mix(Hash(I), Hash(I + 1.0), F);
}

void main()
{
    //OutColor = vec4(FragmentColor * texture(TextureSampler, FragmentTextureCoordinate).rgb, 1.0);
    //OutColor = texture(TextureSampler, FragmentTextureCoordinate);

    //NOTE(Lyubomir): Lantern Light
    vec3 Albedo = texture(TextureSampler, FragmentTextureCoordinate).rgb;
    vec3 N = normalize(FragmentNormal);
    vec3 LightPos = UniformBuffer.LightPosition.xyz;
    vec3 LightCol = UniformBuffer.LightColor.rgb;
    float Time = UniformBuffer.LightPosition.w;
    float BaseIntensity = UniformBuffer.LightColor.w;
    vec3 L = LightPos - FragmentWorldPosistion;
    float Dist = length(L);
    L = normalize(L);

    //NOTE(Lyubomir): Lantern flicker - two noise layers at different speeds
    float Flicker = 0.82 + 0.12 * Noise(Time * 9.0) + 0.06 * Noise(Time * 23.0);
    float Intensity = BaseIntensity * Flicker;

    //NOTE(Lyubomir): Softened falloff - constant term prevents hard cutoff near light
    //               and makes the light reach farther before fading out
    float Attenuation = Intensity / (1.0 + Dist * Dist * 0.04);

    //NOTE(Lyubomir): Diffuse
    float NdotL = max(dot(N, L), 0.0);
    vec3 Diffuse = Albedo * LightCol * NdotL * Attenuation;

    //NOTE(Lyubomir): Specular
    vec3 V = normalize(UniformBuffer.CameraPosition.xyz - FragmentWorldPosistion);
    vec3 H = normalize(L + V);
    float NdotH = max(dot(N, H), 0.0);
    vec3 Specular = LightCol * pow(NdotH, 32.0) * Attenuation * 0.5;

    //NOTE(Lyubomir): Ambient
    vec3 Ambient = Albedo * 0.05;
    OutColor = vec4(Ambient + Diffuse + Specular, 1.0);
}
