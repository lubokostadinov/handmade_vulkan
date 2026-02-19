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

void main()
{
    //OutColor = vec4(FragmentColor * texture(TextureSampler, FragmentTextureCoordinate).rgb, 1.0);
    //OutColor = texture(TextureSampler, FragmentTextureCoordinate);

    //NOTE(Lyubomir): Point Light
    vec3 Albedo = texture(TextureSampler, FragmentTextureCoordinate).rgb;
    vec3 N = normalize(FragmentNormal);
    vec3 LightPos = UniformBuffer.LightPosition.xyz;
    vec3 LightCol = UniformBuffer.LightColor.rgb;
    float Intensity = UniformBuffer.LightColor.w;
    vec3 L = LightPos - FragmentWorldPosistion;
    float Dist = length(L);
    L = normalize(L);

    //NOTE(Lyubomir): Inverse-square falloff
    float Attenuation = Intensity / (Dist * Dist);

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
